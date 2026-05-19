package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.UnidadeMedidaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.UnidadeMedidaResposta;
import br.com.osals.cadastro.dominio.RepositorioUnidadeMedida;
import br.com.osals.cadastro.dominio.UnidadeMedida;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoUnidadeMedida {

    private final RepositorioUnidadeMedida repositorio;

    public ServicoUnidadeMedida(RepositorioUnidadeMedida repositorio) {
        this.repositorio = repositorio;
    }

    public List<UnidadeMedidaResposta> listar() {
        return repositorio.findAll().stream().map(this::paraResposta).toList();
    }

    public UnidadeMedidaResposta buscarPorId(Integer id) {
        return paraResposta(obrigatorio(id));
    }

    @Transactional
    public UnidadeMedidaResposta criar(UnidadeMedidaRequisicao req) {
        String sigla = req.sigla().trim();
        if (repositorio.existsBySigla(sigla)) {
            throw new DuplicidadeException("Ja existe unidade de medida com esta sigla.");
        }
        var u = new UnidadeMedida(sigla, req.nome().trim());
        repositorio.save(u);
        return paraResposta(u);
    }

    @Transactional
    public UnidadeMedidaResposta atualizar(Integer id, UnidadeMedidaRequisicao req) {
        var u = obrigatorio(id);
        u.atualizar(req.sigla().trim(), req.nome().trim());
        return paraResposta(u);
    }

    @Transactional
    public void remover(Integer id) {
        var u = obrigatorio(id);
        repositorio.delete(u);
    }

    private UnidadeMedida obrigatorio(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Unidade de medida nao encontrada."));
    }

    private UnidadeMedidaResposta paraResposta(UnidadeMedida u) {
        return new UnidadeMedidaResposta(u.getId(), u.getSigla(), u.getNome());
    }
}
