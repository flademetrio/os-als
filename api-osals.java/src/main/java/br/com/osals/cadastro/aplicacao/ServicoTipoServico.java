package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CriacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TipoServicoResposta;
import br.com.osals.cadastro.dominio.RepositorioTipoServico;
import br.com.osals.cadastro.dominio.TipoServico;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.servico.dominio.RepositorioServico;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tipos de servico. Admin pode renomear, ativar/desativar, criar novos e
 * excluir. A exclusao falha (409) se houver Servico vinculado.
 */
@Service
@Transactional(readOnly = true)
public class ServicoTipoServico {

    private static final Logger log = LoggerFactory.getLogger(ServicoTipoServico.class);

    private final RepositorioTipoServico repositorio;
    private final RepositorioServico repositorioServico;

    public ServicoTipoServico(RepositorioTipoServico repositorio,
                              RepositorioServico repositorioServico) {
        this.repositorio = repositorio;
        this.repositorioServico = repositorioServico;
    }

    public List<TipoServicoResposta> listar(boolean apenasAtivos) {
        var lista = apenasAtivos ? repositorio.findByAtivoTrueOrderByNome() : repositorio.findAllByOrderByNome();
        return lista.stream().map(t -> new TipoServicoResposta(t.getId(), t.getNome(), t.isAtivo())).toList();
    }

    @Transactional
    public TipoServicoResposta criar(CriacaoTipoServicoRequisicao req) {
        String nome = req.nome().trim();
        if (repositorio.existsByNomeIgnoreCase(nome)) {
            throw new DuplicidadeException("Ja existe um tipo de servico com este nome.");
        }
        var t = new TipoServico(nome);
        var salvo = repositorio.save(t);
        log.info("Tipo de servico criado: id={} nome={}", salvo.getId(), salvo.getNome());
        return new TipoServicoResposta(salvo.getId(), salvo.getNome(), salvo.isAtivo());
    }

    @Transactional
    public TipoServicoResposta atualizar(Integer id, AtualizacaoTipoServicoRequisicao req) {
        var t = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de servico nao encontrado."));
        t.atualizar(req.nome().trim(), req.ativo());
        return new TipoServicoResposta(t.getId(), t.getNome(), t.isAtivo());
    }

    @Transactional
    public void excluir(Integer id) {
        var t = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de servico nao encontrado."));
        long usos = repositorioServico.countByTipoServicoId(id);
        if (usos > 0) {
            throw new NegocioException(
                    "Nao e possivel excluir: existem " + usos + " servico(s) usando este tipo. "
                            + "Desative-o em vez de excluir.");
        }
        repositorio.delete(t);
        log.info("Tipo de servico {} (nome={}) excluido.", id, t.getNome());
    }
}
