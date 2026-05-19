package br.com.osals.seguranca.aplicacao;

import br.com.osals.compartilhado.excecoes.CredenciaisInvalidasException;
import br.com.osals.compartilhado.excecoes.UsuarioBloqueadoException;
import br.com.osals.seguranca.aplicacao.dto.LoginRequisicao;
import br.com.osals.seguranca.aplicacao.dto.ResultadoLogin;
import br.com.osals.seguranca.aplicacao.dto.UsuarioResumoDto;
import br.com.osals.seguranca.dominio.RepositorioTokenRefresh;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.TokenRefresh;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.seguranca.infraestrutura.GeradorJwt;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servico de autenticacao: login, refresh e logout.
 *
 * Implementa:
 *  - Validacao de senha via BCrypt
 *  - Lockout por tentativas (LOGIN_MAX_TENTATIVAS, LOGIN_BLOQUEIO_MINUTOS)
 *  - Rotacao de refresh token (cada uso revoga o anterior e emite novo)
 *  - Deteccao de reuso: refresh ja revogado revoga TUDO do usuario
 */
@Service
@Transactional(readOnly = true)
public class ServicoAutenticacao {

    private static final Logger log = LoggerFactory.getLogger(ServicoAutenticacao.class);

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioTokenRefresh repositorioTokenRefresh;
    private final PasswordEncoder passwordEncoder;
    private final GeradorJwt geradorJwt;

    @Value("${app.seguranca.login-max-tentativas:5}")
    private int loginMaxTentativas;

    @Value("${app.seguranca.login-bloqueio-minutos:15}")
    private int loginBloqueioMinutos;

    public ServicoAutenticacao(RepositorioUsuario repositorioUsuario,
                               RepositorioTokenRefresh repositorioTokenRefresh,
                               PasswordEncoder passwordEncoder,
                               GeradorJwt geradorJwt) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioTokenRefresh = repositorioTokenRefresh;
        this.passwordEncoder = passwordEncoder;
        this.geradorJwt = geradorJwt;
    }

    @Transactional
    public ResultadoLogin login(LoginRequisicao requisicao) {
        Usuario usuario = repositorioUsuario.findByEmail(requisicao.email())
                .orElseThrow(() -> new CredenciaisInvalidasException("Email ou senha invalidos."));

        if (!usuario.isAtivo()) {
            throw new CredenciaisInvalidasException("Conta inativa.");
        }

        if (usuario.estaBloqueado()) {
            throw new UsuarioBloqueadoException("Conta bloqueada por excesso de tentativas. Tente novamente em alguns minutos.");
        }

        if (!passwordEncoder.matches(requisicao.senha(), usuario.getSenhaHash())) {
            usuario.registrarLoginFalho(loginMaxTentativas, loginBloqueioMinutos);
            repositorioUsuario.save(usuario);
            throw new CredenciaisInvalidasException("Email ou senha invalidos.");
        }

        usuario.registrarLoginComSucesso();
        repositorioUsuario.save(usuario);

        return gerarParDeTokens(usuario);
    }

    @Transactional
    public ResultadoLogin refresh(String refreshTokenEnviado) {
        String hash = sha256Hex(refreshTokenEnviado);

        TokenRefresh tokenExistente = repositorioTokenRefresh.findByTokenHash(hash)
                .orElseThrow(() -> new CredenciaisInvalidasException("Token de refresh invalido."));

        if (tokenExistente.estaRevogado()) {
            // Deteccao de reuso de token revogado: invalida toda a familia
            log.warn("Reuso de refresh token revogado detectado para usuario {}. Revogando todos.", tokenExistente.getUsuario().getId());
            repositorioTokenRefresh.revogarTodosDoUsuario(tokenExistente.getUsuario().getId());
            throw new CredenciaisInvalidasException("Token de refresh invalido.");
        }

        if (tokenExistente.estaExpirado()) {
            throw new CredenciaisInvalidasException("Token de refresh expirado.");
        }

        Usuario usuario = tokenExistente.getUsuario();
        if (!usuario.isAtivo()) {
            tokenExistente.revogar();
            repositorioTokenRefresh.save(tokenExistente);
            throw new CredenciaisInvalidasException("Conta inativa.");
        }

        // Rotacao
        ResultadoLogin novoPar = gerarParDeTokens(usuario);
        // Marca o antigo como revogado e linka ao novo
        TokenRefresh novoToken = repositorioTokenRefresh.findByTokenHash(sha256Hex(novoPar.refreshToken())).orElseThrow();
        tokenExistente.revogarESubstituirPor(novoToken);
        repositorioTokenRefresh.save(tokenExistente);

        return novoPar;
    }

    @Transactional
    public void logout(String refreshTokenEnviado) {
        if (refreshTokenEnviado == null || refreshTokenEnviado.isBlank()) {
            return;
        }
        repositorioTokenRefresh.findByTokenHash(sha256Hex(refreshTokenEnviado))
                .ifPresent(t -> {
                    t.revogar();
                    repositorioTokenRefresh.save(t);
                });
    }

    public UsuarioResumoDto eu(Usuario usuario) {
        return UsuarioResumoDto.de(usuario);
    }

    private ResultadoLogin gerarParDeTokens(Usuario usuario) {
        String accessToken = geradorJwt.gerarAccessToken(usuario);
        String refreshOpaco = geradorJwt.gerarRefreshTokenOpaco();
        Instant refreshExpira = geradorJwt.expiracaoRefreshInstant();

        TokenRefresh refresh = new TokenRefresh(
                usuario,
                sha256Hex(refreshOpaco),
                OffsetDateTime.ofInstant(refreshExpira, ZoneOffset.UTC)
        );
        repositorioTokenRefresh.save(refresh);

        return new ResultadoLogin(
                UsuarioResumoDto.de(usuario),
                accessToken,
                refreshOpaco,
                Instant.ofEpochMilli(geradorJwt.expiracaoAccessMillis()),
                refreshExpira
        );
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
