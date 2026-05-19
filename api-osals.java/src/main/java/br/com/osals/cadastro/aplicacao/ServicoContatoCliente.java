package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.ContatoClienteRequisicao;
import br.com.osals.cadastro.aplicacao.dto.ContatoClienteResposta;
import br.com.osals.cadastro.dominio.ContatoCliente;
import br.com.osals.cadastro.dominio.RepositorioContatoCliente;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoContatoCliente {

    private final RepositorioContatoCliente repositorio;
    private final ServicoCliente servicoCliente;
    private final MapperCadastro mapper;

    public ServicoContatoCliente(RepositorioContatoCliente repositorio,
                                 ServicoCliente servicoCliente,
                                 MapperCadastro mapper) {
        this.repositorio = repositorio;
        this.servicoCliente = servicoCliente;
        this.mapper = mapper;
    }

    public List<ContatoClienteResposta> listarDoCliente(Long clienteId) {
        return repositorio.findByClienteIdOrderByNome(clienteId).stream()
                .map(mapper::paraContatoResposta)
                .toList();
    }

    @Transactional
    public ContatoClienteResposta criar(Long clienteId, ContatoClienteRequisicao req) {
        var cliente = servicoCliente.obrigatorio(clienteId);
        var contato = new ContatoCliente(cliente, req.nome().trim(),
                normalizar(req.funcao()), normalizar(req.telefone()), normalizar(req.email()));
        repositorio.save(contato);
        return mapper.paraContatoResposta(contato);
    }

    @Transactional
    public ContatoClienteResposta atualizar(Long id, ContatoClienteRequisicao req) {
        var c = obrigatorio(id);
        c.atualizar(req.nome().trim(), normalizar(req.funcao()), normalizar(req.telefone()), normalizar(req.email()));
        return mapper.paraContatoResposta(c);
    }

    @Transactional
    public void remover(Long id) {
        var c = obrigatorio(id);
        repositorio.delete(c);
    }

    private ContatoCliente obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Contato nao encontrado."));
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
