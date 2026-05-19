package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TipoServicoResposta;
import br.com.osals.cadastro.dominio.RepositorioTipoServico;
import br.com.osals.cadastro.dominio.TipoServico;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Apenas admin altera (renomear/ativar). NAO permite criacao via API
 * (decisao V1 — ver documentacao/08).
 */
@Service
@Transactional(readOnly = true)
public class ServicoTipoServico {

    private final RepositorioTipoServico repositorio;

    public ServicoTipoServico(RepositorioTipoServico repositorio) {
        this.repositorio = repositorio;
    }

    public List<TipoServicoResposta> listar(boolean apenasAtivos) {
        var lista = apenasAtivos ? repositorio.findByAtivoTrueOrderByNome() : repositorio.findAllByOrderByNome();
        return lista.stream().map(t -> new TipoServicoResposta(t.getId(), t.getNome(), t.isAtivo())).toList();
    }

    @Transactional
    public TipoServicoResposta atualizar(Integer id, AtualizacaoTipoServicoRequisicao req) {
        var t = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de servico nao encontrado."));
        t.atualizar(req.nome().trim(), req.ativo());
        return new TipoServicoResposta(t.getId(), t.getNome(), t.isAtivo());
    }
}
