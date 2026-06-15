package br.com.osals.seguranca.aplicacao;

import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.aplicacao.dto.AtualizacaoPermissoesRequisicao;
import br.com.osals.seguranca.aplicacao.dto.AtualizacaoUsuarioRequisicao;
import br.com.osals.seguranca.aplicacao.dto.CatalogoPermissoesResposta;
import br.com.osals.seguranca.aplicacao.dto.CriacaoUsuarioRequisicao;
import br.com.osals.seguranca.aplicacao.dto.PermissaoDto;
import br.com.osals.seguranca.aplicacao.dto.UsuarioAdminResposta;
import br.com.osals.seguranca.aplicacao.dto.UsuarioAdminResumoDto;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Permissao;
import br.com.osals.seguranca.dominio.PresetsPermissao;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.Usuario;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Administracao de usuarios e suas permissoes (atras da permissao USUARIO_GERENCIAR).
 *
 * Tecnicos NAO sao criados/editados aqui — eles tem cadastro proprio (valor/hora)
 * via /tecnicos; este servico recusa o papel TECNICO para nao deixar um usuario
 * tecnico sem a linha correspondente em 'tecnico'.
 *
 * As mudancas de permissao tem efeito imediato: o filtro JWT recarrega o usuario
 * (e suas permissoes) a cada requisicao, entao nao e' preciso invalidar tokens.
 */
@Service
@Transactional(readOnly = true)
public class ServicoUsuario {

    private static final Logger log = LoggerFactory.getLogger(ServicoUsuario.class);

    private final RepositorioUsuario repositorio;
    private final PasswordEncoder passwordEncoder;

    public ServicoUsuario(RepositorioUsuario repositorio, PasswordEncoder passwordEncoder) {
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioAdminResumoDto> listar() {
        return repositorio.findAllByOrderByNomeAsc().stream()
                .map(UsuarioAdminResumoDto::de)
                .toList();
    }

    public UsuarioAdminResposta buscarPorId(Long id) {
        return UsuarioAdminResposta.de(obrigatorio(id));
    }

    /** Catalogo de permissoes + presets por papel (para a tela de administracao). */
    public CatalogoPermissoesResposta catalogo() {
        List<PermissaoDto> permissoes = Arrays.stream(Permissao.values())
                .map(PermissaoDto::de)
                .toList();

        Map<String, List<String>> presets = new LinkedHashMap<>();
        for (Papel papel : Papel.values()) {
            List<String> nomes = PresetsPermissao.doPapel(papel).stream()
                    .map(Permissao::name)
                    .sorted()
                    .toList();
            presets.put(papel.name(), nomes);
        }
        return new CatalogoPermissoesResposta(permissoes, presets);
    }

    @Transactional
    public UsuarioAdminResposta criar(CriacaoUsuarioRequisicao req) {
        recusarTecnico(req.papel());
        String email = req.email().trim().toLowerCase();
        if (repositorio.existsByEmail(email)) {
            throw new DuplicidadeException("Ja existe um usuario com este email.");
        }

        var usuario = new Usuario(req.nome().trim(), email,
                passwordEncoder.encode(req.senha()), req.papel());
        usuario.definirPermissoes(PresetsPermissao.doPapel(req.papel()));
        repositorio.save(usuario);

        log.info("Usuario criado: id={} email={} papel={}", usuario.getId(), email, req.papel());
        return UsuarioAdminResposta.de(usuario);
    }

    @Transactional
    public UsuarioAdminResposta atualizar(Long id, AtualizacaoUsuarioRequisicao req) {
        var usuario = obrigatorio(id);
        if (usuario.getPapel() == Papel.TECNICO || req.papel() == Papel.TECNICO) {
            throw new NegocioException("Tecnicos sao gerenciados pela tela de tecnicos.");
        }
        usuario.setNome(req.nome().trim());
        usuario.setPapel(req.papel());
        log.info("Usuario {} atualizado: papel={}", id, req.papel());
        return UsuarioAdminResposta.de(usuario);
    }

    @Transactional
    public UsuarioAdminResposta definirPermissoes(Long id, AtualizacaoPermissoesRequisicao req, Usuario autor) {
        var usuario = obrigatorio(id);
        Set<Permissao> novas = converter(req.permissoes());

        // Anti-lockout: ninguem pode remover de si mesmo a permissao de gerenciar usuarios.
        if (usuario.getId().equals(autor.getId()) && !novas.contains(Permissao.USUARIO_GERENCIAR)) {
            throw new NegocioException("Voce nao pode remover sua propria permissao de gerenciar usuarios.");
        }

        usuario.definirPermissoes(novas);
        log.info("Permissoes do usuario {} atualizadas para {}", id, novas);
        return UsuarioAdminResposta.de(usuario);
    }

    @Transactional
    public void inativar(Long id, Usuario autor) {
        if (id.equals(autor.getId())) {
            throw new NegocioException("Voce nao pode inativar a si mesmo.");
        }
        var usuario = obrigatorio(id);
        if (usuario.isAtivo()) {
            usuario.setAtivo(false);
            usuario.invalidarTokens();
            log.info("Usuario inativado: id={}", id);
        }
    }

    @Transactional
    public void ativar(Long id) {
        var usuario = obrigatorio(id);
        if (!usuario.isAtivo()) {
            usuario.setAtivo(true);
            log.info("Usuario reativado: id={}", id);
        }
    }

    // --- helpers ---

    private Set<Permissao> converter(Set<String> nomes) {
        if (nomes == null || nomes.isEmpty()) {
            return EnumSet.noneOf(Permissao.class);
        }
        return nomes.stream()
                .map(this::parsePermissao)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(Permissao.class)));
    }

    private Permissao parsePermissao(String nome) {
        try {
            return Permissao.valueOf(nome.trim());
        } catch (IllegalArgumentException e) {
            throw new NegocioException("Permissao desconhecida: " + nome);
        }
    }

    private void recusarTecnico(Papel papel) {
        if (papel == Papel.TECNICO) {
            throw new NegocioException("Tecnicos sao criados pela tela de tecnicos.");
        }
    }

    private Usuario obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }
}
