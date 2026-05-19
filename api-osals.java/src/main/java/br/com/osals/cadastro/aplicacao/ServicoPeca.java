package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.PecaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.PecaResposta;
import br.com.osals.cadastro.dominio.Peca;
import br.com.osals.cadastro.dominio.RepositorioPeca;
import br.com.osals.cadastro.dominio.RepositorioUnidadeMedida;
import br.com.osals.cadastro.dominio.UnidadeMedida;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoPeca {

    private final RepositorioPeca repositorio;
    private final RepositorioUnidadeMedida repositorioUnidade;

    public ServicoPeca(RepositorioPeca repositorio, RepositorioUnidadeMedida repositorioUnidade) {
        this.repositorio = repositorio;
        this.repositorioUnidade = repositorioUnidade;
    }

    public PaginaResposta<PecaResposta> listar(String busca, boolean apenasAtivos, Pageable pageable) {
        String b = (busca == null || busca.isBlank()) ? "" : busca.trim();
        var page = repositorio.buscarFiltrado(b, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(this::paraResposta));
    }

    public PecaResposta buscarPorId(Long id) {
        return paraResposta(obrigatorio(id));
    }

    @Transactional
    public PecaResposta criar(PecaRequisicao req) {
        UnidadeMedida um = resolverUnidadeMedida(req.unidadeMedidaId());
        var p = new Peca(req.nome().trim(), normalizar(req.descricao()), um);
        repositorio.save(p);
        return paraResposta(p);
    }

    @Transactional
    public PecaResposta atualizar(Long id, PecaRequisicao req) {
        var p = obrigatorio(id);
        UnidadeMedida um = resolverUnidadeMedida(req.unidadeMedidaId());
        p.atualizar(req.nome().trim(), normalizar(req.descricao()), um);
        return paraResposta(p);
    }

    @Transactional
    public void inativar(Long id) {
        var p = obrigatorio(id);
        if (p.isAtivo()) p.inativar();
    }

    @Transactional
    public void reativar(Long id) {
        var p = obrigatorio(id);
        if (!p.isAtivo()) p.reativar();
    }

    private UnidadeMedida resolverUnidadeMedida(Integer id) {
        if (id == null) return null;
        return repositorioUnidade.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Unidade de medida nao encontrada."));
    }

    private Peca obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Peca nao encontrada."));
    }

    private PecaResposta paraResposta(Peca p) {
        return new PecaResposta(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getUnidadeMedida() != null ? p.getUnidadeMedida().getId() : null,
                p.getUnidadeMedida() != null ? p.getUnidadeMedida().getSigla() : null,
                p.isAtivo()
        );
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
