package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.FornecedorRequisicao;
import br.com.osals.cadastro.aplicacao.dto.FornecedorResposta;
import br.com.osals.cadastro.dominio.Fornecedor;
import br.com.osals.cadastro.dominio.RepositorioFornecedor;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoFornecedor {

    private final RepositorioFornecedor repositorio;

    public ServicoFornecedor(RepositorioFornecedor repositorio) {
        this.repositorio = repositorio;
    }

    public PaginaResposta<FornecedorResposta> listar(String busca, boolean apenasAtivos, Pageable pageable) {
        String b = (busca == null || busca.isBlank()) ? null : busca.trim();
        var page = repositorio.buscarFiltrado(b, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(this::paraResposta));
    }

    public FornecedorResposta buscarPorId(Long id) {
        return paraResposta(obrigatorio(id));
    }

    @Transactional
    public FornecedorResposta criar(FornecedorRequisicao req) {
        var f = new Fornecedor(req.nome().trim());
        f.atualizar(req.nome().trim(), req.tipoPessoa(),
                normalizarDocumento(req.documento()),
                normalizar(req.telefone()), normalizar(req.email()));
        repositorio.save(f);
        return paraResposta(f);
    }

    @Transactional
    public FornecedorResposta atualizar(Long id, FornecedorRequisicao req) {
        var f = obrigatorio(id);
        f.atualizar(req.nome().trim(), req.tipoPessoa(),
                normalizarDocumento(req.documento()),
                normalizar(req.telefone()), normalizar(req.email()));
        return paraResposta(f);
    }

    @Transactional
    public void inativar(Long id) {
        var f = obrigatorio(id);
        if (f.isAtivo()) f.inativar();
    }

    @Transactional
    public void reativar(Long id) {
        var f = obrigatorio(id);
        if (!f.isAtivo()) f.reativar();
    }

    private Fornecedor obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor nao encontrado."));
    }

    private FornecedorResposta paraResposta(Fornecedor f) {
        return new FornecedorResposta(
                f.getId(), f.getNome(), f.getTipoPessoa(), f.getDocumento(),
                f.getTelefone(), f.getEmail(), f.isAtivo()
        );
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizarDocumento(String s) {
        if (s == null) return null;
        var t = s.replaceAll("\\D", "");
        return t.isEmpty() ? null : t;
    }
}
