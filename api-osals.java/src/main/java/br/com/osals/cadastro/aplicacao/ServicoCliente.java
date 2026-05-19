package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoClienteRequisicao;
import br.com.osals.cadastro.aplicacao.dto.ClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.ClienteResumoDto;
import br.com.osals.cadastro.aplicacao.dto.CriacaoClienteRequisicao;
import br.com.osals.cadastro.dominio.Cliente;
import br.com.osals.cadastro.dominio.RepositorioCliente;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.dominio.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoCliente {

    private static final Logger log = LoggerFactory.getLogger(ServicoCliente.class);

    private final RepositorioCliente repositorio;
    private final MapperCadastro mapper;

    public ServicoCliente(RepositorioCliente repositorio, MapperCadastro mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public PaginaResposta<ClienteResumoDto> listar(String busca, boolean apenasAtivos, Pageable pageable) {
        String buscaNormalizada = (busca == null || busca.isBlank()) ? null : busca.trim();
        var page = repositorio.buscarFiltrado(buscaNormalizada, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(mapper::paraClienteResumo));
    }

    public ClienteResposta buscarPorId(Long id) {
        var c = obrigatorio(id);
        return mapper.paraClienteResposta(c);
    }

    @Transactional
    public ClienteResposta criar(CriacaoClienteRequisicao req, Usuario autor) {
        String docNormalizado = somenteDigitos(req.documento());

        if (repositorio.existsByDocumento(docNormalizado)) {
            throw new DuplicidadeException("Ja existe um cliente com este documento.");
        }

        var cliente = new Cliente(req.tipoPessoa(), docNormalizado, req.nome().trim(),
                normalizar(req.nomeFantasia()), autor);
        var salvo = repositorio.save(cliente);
        log.info("Cliente criado: id={} documento={}", salvo.getId(), salvo.getDocumento());
        return mapper.paraClienteResposta(salvo);
    }

    @Transactional
    public ClienteResposta atualizar(Long id, AtualizacaoClienteRequisicao req, Usuario autor) {
        var c = obrigatorio(id);
        c.atualizar(req.nome().trim(), normalizar(req.nomeFantasia()), autor);
        return mapper.paraClienteResposta(c);
    }

    @Transactional
    public void inativar(Long id, Usuario autor) {
        var c = obrigatorio(id);
        if (!c.isAtivo()) return;
        c.inativar(autor);
        log.info("Cliente inativado: id={}", id);
    }

    @Transactional
    public void reativar(Long id, Usuario autor) {
        var c = obrigatorio(id);
        if (c.isAtivo()) return;
        c.reativar(autor);
        log.info("Cliente reativado: id={}", id);
    }

    Cliente obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente nao encontrado."));
    }

    private static String somenteDigitos(String s) {
        return s == null ? null : s.replaceAll("\\D", "");
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
