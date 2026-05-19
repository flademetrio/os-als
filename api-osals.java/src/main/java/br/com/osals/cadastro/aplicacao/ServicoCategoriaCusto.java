package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoCategoriaCustoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CategoriaCustoResposta;
import br.com.osals.cadastro.dominio.CategoriaCusto;
import br.com.osals.cadastro.dominio.RepositorioCategoriaCusto;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin pode renomear/ativar/desativar. NAO permite criar novas categorias
 * (cada tipo_lancamento esta acoplado a logica do app — ver documentacao/08).
 */
@Service
@Transactional(readOnly = true)
public class ServicoCategoriaCusto {

    private final RepositorioCategoriaCusto repositorio;

    public ServicoCategoriaCusto(RepositorioCategoriaCusto repositorio) {
        this.repositorio = repositorio;
    }

    public List<CategoriaCustoResposta> listar(boolean apenasAtivos) {
        var lista = apenasAtivos ? repositorio.findByAtivoTrueOrderByNome() : repositorio.findAllByOrderByNome();
        return lista.stream().map(this::paraResposta).toList();
    }

    @Transactional
    public CategoriaCustoResposta atualizar(Integer id, AtualizacaoCategoriaCustoRequisicao req) {
        var c = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria de custo nao encontrada."));
        c.atualizar(req.nome().trim(), req.ativo());
        return paraResposta(c);
    }

    private CategoriaCustoResposta paraResposta(CategoriaCusto c) {
        return new CategoriaCustoResposta(c.getId(), c.getCodigo(), c.getNome(), c.getTipoLancamento(), c.isAtivo());
    }
}
