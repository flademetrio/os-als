package br.com.osals.seguranca.aplicacao;

import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.aplicacao.dto.LinkRedefinicaoResposta;
import br.com.osals.seguranca.aplicacao.dto.ValidacaoLinkResposta;
import br.com.osals.seguranca.dominio.RepositorioTokenRedefinicaoSenha;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.TokenRedefinicaoSenha;
import br.com.osals.seguranca.dominio.Usuario;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Redefinicao de senha por link: o admin gera um link com token (valido por
 * algumas horas), envia manualmente, e o usuario abre e define a nova senha.
 *
 * Guardamos so o hash SHA-256 do token (igual ao refresh token). Token e' de uso
 * unico; gerar um novo invalida os anteriores nao usados. Ao redefinir, a nova
 * senha e' bcrypt e as sessoes vigentes do usuario sao invalidadas.
 */
@Service
@Transactional(readOnly = true)
public class ServicoRedefinicaoSenha {

    private static final Logger log = LoggerFactory.getLogger(ServicoRedefinicaoSenha.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioTokenRedefinicaoSenha repositorio;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seguranca.redefinicao-senha-horas:3}")
    private int validadeHoras;

    public ServicoRedefinicaoSenha(RepositorioUsuario repositorioUsuario,
                                   RepositorioTokenRedefinicaoSenha repositorio,
                                   PasswordEncoder passwordEncoder) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
    }

    /** Admin gera um link para o usuario. Invalida links anteriores nao usados. */
    @Transactional
    public LinkRedefinicaoResposta gerar(Long usuarioId, Usuario autor) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));

        repositorio.invalidarNaoUsadosDoUsuario(usuarioId);

        String tokenCru = gerarTokenOpaco();
        var token = new TokenRedefinicaoSenha(
                usuario,
                sha256Hex(tokenCru),
                OffsetDateTime.now().plusHours(validadeHoras),
                autor);
        repositorio.save(token);

        log.info("Link de redefinicao de senha gerado para usuario {} por {}", usuarioId, autor.getId());
        return new LinkRedefinicaoResposta(tokenCru, token.getExpiraEm());
    }

    /** Publico: diz se o token e' valido e, se for, o primeiro nome do usuario. */
    public ValidacaoLinkResposta validar(String tokenCru) {
        if (tokenCru == null || tokenCru.isBlank()) {
            return new ValidacaoLinkResposta(false, null);
        }
        return repositorio.findByTokenHash(sha256Hex(tokenCru))
                .filter(TokenRedefinicaoSenha::estaValido)
                .map(t -> new ValidacaoLinkResposta(true, primeiroNome(t.getUsuario().getNome())))
                .orElse(new ValidacaoLinkResposta(false, null));
    }

    /** Publico: consome o token e troca a senha (invalida sessoes vigentes). */
    @Transactional
    public void redefinir(String tokenCru, String novaSenha) {
        var token = repositorio.findByTokenHash(sha256Hex(tokenCru))
                .filter(TokenRedefinicaoSenha::estaValido)
                .orElseThrow(() -> new NegocioException("Link invalido ou expirado."));

        Usuario usuario = token.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuario.invalidarTokens();
        token.marcarUsado();
        log.info("Senha redefinida por link para usuario {}", usuario.getId());
    }

    private static String gerarTokenOpaco() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String primeiroNome(String nome) {
        if (nome == null) return null;
        var t = nome.trim();
        return t.isEmpty() ? null : t.split("\\s+")[0];
    }

    private static String sha256Hex(String texto) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(texto.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 nao disponivel", e);
        }
    }
}
