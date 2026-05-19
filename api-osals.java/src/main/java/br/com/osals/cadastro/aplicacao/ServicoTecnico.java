package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTecnicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CriacaoTecnicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.RedefinicaoSenhaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TecnicoResposta;
import br.com.osals.cadastro.aplicacao.dto.TecnicoResumoDto;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.RepositorioTecnico;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoTecnico {

    private static final Logger log = LoggerFactory.getLogger(ServicoTecnico.class);

    private final RepositorioTecnico repositorioTecnico;
    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;

    public ServicoTecnico(RepositorioTecnico repositorioTecnico,
                          RepositorioUsuario repositorioUsuario,
                          PasswordEncoder passwordEncoder) {
        this.repositorioTecnico = repositorioTecnico;
        this.repositorioUsuario = repositorioUsuario;
        this.passwordEncoder = passwordEncoder;
    }

    public PaginaResposta<TecnicoResumoDto> listar(String busca, boolean apenasAtivos, Pageable pageable) {
        String b = (busca == null || busca.isBlank()) ? null : busca.trim();
        var page = repositorioTecnico.buscarFiltrado(b, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(this::paraResumo));
    }

    public TecnicoResposta buscarPorId(Long id) {
        return paraResposta(obrigatorio(id));
    }

    @Transactional
    public TecnicoResposta criar(CriacaoTecnicoRequisicao req) {
        String email = req.email().trim().toLowerCase();

        if (repositorioUsuario.existsByEmail(email)) {
            throw new DuplicidadeException("Ja existe um usuario com este email.");
        }

        var usuario = new Usuario(
                req.nome().trim(),
                email,
                passwordEncoder.encode(req.senha()),
                Papel.TECNICO
        );
        repositorioUsuario.save(usuario);

        var tecnico = new Tecnico(usuario, req.valorHoraCentavos(),
                normalizar(req.especialidade()), normalizar(req.telefone()));
        repositorioTecnico.save(tecnico);

        log.info("Tecnico criado: id={} email={}", usuario.getId(), email);
        return paraResposta(tecnico);
    }

    @Transactional
    public TecnicoResposta atualizar(Long id, AtualizacaoTecnicoRequisicao req) {
        var t = obrigatorio(id);
        t.getUsuario().setNome(req.nome().trim());
        t.setValorHoraCentavos(req.valorHoraCentavos());
        t.setEspecialidade(normalizar(req.especialidade()));
        t.setTelefone(normalizar(req.telefone()));
        return paraResposta(t);
    }

    @Transactional
    public void redefinirSenha(Long id, RedefinicaoSenhaRequisicao req) {
        var t = obrigatorio(id);
        t.getUsuario().setSenhaHash(passwordEncoder.encode(req.novaSenha()));
        t.getUsuario().invalidarTokens(); // invalida sessoes vigentes
        log.info("Senha redefinida do tecnico id={}", id);
    }

    @Transactional
    public void inativar(Long id) {
        var t = obrigatorio(id);
        if (t.getUsuario().isAtivo()) {
            t.getUsuario().setAtivo(false);
            t.getUsuario().invalidarTokens();
            log.info("Tecnico inativado: id={}", id);
        }
    }

    @Transactional
    public void reativar(Long id) {
        var t = obrigatorio(id);
        if (!t.getUsuario().isAtivo()) {
            t.getUsuario().setAtivo(true);
            log.info("Tecnico reativado: id={}", id);
        }
    }

    private Tecnico obrigatorio(Long id) {
        return repositorioTecnico.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tecnico nao encontrado."));
    }

    private TecnicoResposta paraResposta(Tecnico t) {
        var u = t.getUsuario();
        return new TecnicoResposta(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                t.getEspecialidade(),
                t.getTelefone(),
                t.getValorHoraCentavos(),
                u.isAtivo()
        );
    }

    private TecnicoResumoDto paraResumo(Tecnico t) {
        var u = t.getUsuario();
        return new TecnicoResumoDto(u.getId(), u.getNome(), t.getEspecialidade(), u.isAtivo());
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
