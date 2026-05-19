package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.UnidadeRequisicao;
import br.com.osals.cadastro.aplicacao.dto.UnidadeResposta;
import br.com.osals.cadastro.dominio.RepositorioUnidade;
import br.com.osals.cadastro.dominio.Unidade;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoUnidade {

    private final RepositorioUnidade repositorio;
    private final ServicoCliente servicoCliente;
    private final MapperCadastro mapper;

    public ServicoUnidade(RepositorioUnidade repositorio, ServicoCliente servicoCliente, MapperCadastro mapper) {
        this.repositorio = repositorio;
        this.servicoCliente = servicoCliente;
        this.mapper = mapper;
    }

    public List<UnidadeResposta> listarDoCliente(Long clienteId, boolean apenasAtivas) {
        var lista = apenasAtivas
                ? repositorio.findByClienteIdAndAtivoTrueOrderByIdentificacaoInterna(clienteId)
                : repositorio.findByClienteIdOrderByIdentificacaoInterna(clienteId);
        return lista.stream().map(mapper::paraUnidadeResposta).toList();
    }

    public UnidadeResposta buscarPorId(Long id) {
        return mapper.paraUnidadeResposta(obrigatorio(id));
    }

    @Transactional
    public UnidadeResposta criar(Long clienteId, UnidadeRequisicao req) {
        var cliente = servicoCliente.obrigatorio(clienteId);
        var unidade = new Unidade(cliente, req.identificacaoInterna().trim());
        unidade.atualizar(
                req.identificacaoInterna().trim(),
                normalizar(req.cep()),
                normalizar(req.logradouro()),
                normalizar(req.numero()),
                normalizar(req.complemento()),
                normalizar(req.bairro()),
                normalizar(req.cidade()),
                normalizar(req.estado())
        );
        repositorio.save(unidade);
        return mapper.paraUnidadeResposta(unidade);
    }

    @Transactional
    public UnidadeResposta atualizar(Long id, UnidadeRequisicao req) {
        var u = obrigatorio(id);
        u.atualizar(
                req.identificacaoInterna().trim(),
                normalizar(req.cep()),
                normalizar(req.logradouro()),
                normalizar(req.numero()),
                normalizar(req.complemento()),
                normalizar(req.bairro()),
                normalizar(req.cidade()),
                normalizar(req.estado())
        );
        return mapper.paraUnidadeResposta(u);
    }

    @Transactional
    public void inativar(Long id) {
        var u = obrigatorio(id);
        if (u.isAtivo()) u.inativar();
    }

    private Unidade obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Unidade nao encontrada."));
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
