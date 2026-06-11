package br.com.osals.servico.aplicacao;

import br.com.osals.anexo.aplicacao.GestorAnexo;
import br.com.osals.cadastro.dominio.Cliente;
import br.com.osals.cadastro.dominio.RepositorioCliente;
import br.com.osals.cadastro.dominio.RepositorioTipoServico;
import br.com.osals.cadastro.dominio.TipoServico;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.ordemservico.aplicacao.GestorOrdemServico;
import br.com.osals.ordemservico.dominio.RepositorioOrdemServico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.AtualizacaoServicoRequisicao;
import br.com.osals.servico.aplicacao.dto.CriacaoServicoRequisicao;
import br.com.osals.servico.aplicacao.dto.ServicoResposta;
import br.com.osals.servico.aplicacao.dto.ServicoResumoDto;
import br.com.osals.servico.dominio.EmpresaServico;
import br.com.osals.servico.dominio.EspecificacoesServico;
import br.com.osals.servico.dominio.RepositorioLancamentoCusto;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import br.com.osals.servico.dominio.StatusServico;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra o ciclo de vida do Servico: criacao, edicao e transicoes de status.
 * A validacao de transicoes vive na entidade Servico / enum StatusServico.
 */
@Service
@Transactional(readOnly = true)
public class GestorServico {

    private static final Logger log = LoggerFactory.getLogger(GestorServico.class);

    private final RepositorioServico repositorio;
    private final RepositorioCliente repositorioCliente;
    private final RepositorioTipoServico repositorioTipoServico;
    private final RepositorioOrdemServico repositorioOrdemServico;
    private final RepositorioLancamentoCusto repositorioLancamentoCusto;
    private final GestorOrdemServico gestorOrdemServico;
    private final GestorAnexo gestorAnexo;
    private final MapperServico mapper;

    public GestorServico(RepositorioServico repositorio,
                         RepositorioCliente repositorioCliente,
                         RepositorioTipoServico repositorioTipoServico,
                         RepositorioOrdemServico repositorioOrdemServico,
                         RepositorioLancamentoCusto repositorioLancamentoCusto,
                         GestorOrdemServico gestorOrdemServico,
                         GestorAnexo gestorAnexo,
                         MapperServico mapper) {
        this.repositorio = repositorio;
        this.repositorioCliente = repositorioCliente;
        this.repositorioTipoServico = repositorioTipoServico;
        this.repositorioOrdemServico = repositorioOrdemServico;
        this.repositorioLancamentoCusto = repositorioLancamentoCusto;
        this.gestorOrdemServico = gestorOrdemServico;
        this.gestorAnexo = gestorAnexo;
        this.mapper = mapper;
    }

    public PaginaResposta<ServicoResumoDto> listar(List<StatusServico> status, EmpresaServico empresa,
                                                   Long clienteId, Integer tipoServicoId,
                                                   LocalDate inicio, LocalDate fim, String busca,
                                                   Pageable pageable) {
        // Sem filtro de status -> considera todos (evita IN com lista vazia).
        List<StatusServico> statusFiltro =
                (status == null || status.isEmpty()) ? List.of(StatusServico.values()) : status;
        var spec = EspecificacoesServico.comFiltros(
                statusFiltro, empresa, clienteId, tipoServicoId, inicio, fim, busca);
        var page = repositorio.findAll(spec, pageable);
        return PaginaResposta.de(page.map(mapper::paraResumo));
    }

    public ServicoResposta buscarPorId(Long id) {
        return mapper.paraResposta(obrigatorio(id));
    }

    @Transactional
    public ServicoResposta criar(CriacaoServicoRequisicao req, Usuario autor) {
        Cliente cliente = repositorioCliente.findById(req.clienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente nao encontrado."));
        if (!cliente.isAtivo()) {
            throw new NegocioException("Nao e possivel abrir Servico para cliente inativo.");
        }
        TipoServico tipo = tipoServicoAtivo(req.tipoServicoId());
        validarDatas(req.dataInicioPrevista(), req.dataFimPrevista());

        int numero = repositorio.proximoNumero().intValue();
        var servico = new Servico(numero, cliente, tipo, req.descricao().trim(),
                req.empresa(), req.dataInicioPrevista(), req.dataFimPrevista(), autor);
        var salvo = repositorio.save(servico);
        log.info("Servico criado: id={} numero={} cliente={}",
                salvo.getId(), salvo.getNumero(), cliente.getId());
        return mapper.paraResposta(salvo);
    }

    @Transactional
    public ServicoResposta atualizar(Long id, AtualizacaoServicoRequisicao req, Usuario autor) {
        var s = obrigatorio(id);
        TipoServico tipo = tipoServicoAtivo(req.tipoServicoId());
        validarDatas(req.dataInicioPrevista(), req.dataFimPrevista());
        s.atualizarDados(tipo, req.descricao().trim(), req.empresa(),
                req.dataInicioPrevista(), req.dataFimPrevista(), autor);
        return mapper.paraResposta(s);
    }

    @Transactional
    public ServicoResposta mudarStatus(Long id, StatusServico destino, Usuario autor) {
        var s = obrigatorio(id);
        s.mudarStatus(destino, autor);
        log.info("Servico {} mudou para status {}", id, destino);
        return mapper.paraResposta(s);
    }

    @Transactional
    public ServicoResposta finalizar(Long id, Usuario autor) {
        var s = obrigatorio(id);
        s.finalizar(autor);
        log.info("Servico {} finalizado por usuario {}", id, autor.getId());
        return mapper.paraResposta(s);
    }

    @Transactional
    public ServicoResposta cancelar(Long id, Usuario autor) {
        var s = obrigatorio(id);
        s.cancelar(autor);
        log.info("Servico {} cancelado por usuario {}", id, autor.getId());
        return mapper.paraResposta(s);
    }

    /**
     * Operacao administrativa: apaga o Servico e tudo o que depende dele
     * (OS + anexos das OS + lancamentos de custo + anexos do servico).
     * Endpoint restrito a ADMIN.
     */
    @Transactional
    public void excluir(Long id, Usuario autor) {
        var s = obrigatorio(id);

        // 1. Apaga cada OS do servico via gestor (cuida do anexo + cascade)
        var oss = repositorioOrdemServico.findByServicoIdOrderByNumero(id);
        for (var os : oss) {
            gestorOrdemServico.excluir(os.getId(), autor);
        }

        // 2. Apaga lancamentos de custo do servico
        var lancamentos = repositorioLancamentoCusto.listarDoServico(id);
        if (!lancamentos.isEmpty()) {
            repositorioLancamentoCusto.deleteAll(lancamentos);
        }

        // 3. Apaga anexos do proprio servico (storage + registros)
        gestorAnexo.apagarTodosAnexosDoServico(id);

        // 4. Apaga o Servico
        repositorio.delete(s);

        log.info("Servico {} (numero {}) excluido por usuario {} (admin) — "
                + "{} OS, {} lancamentos",
                id, s.getNumero(), autor.getId(), oss.size(), lancamentos.size());
    }

    Servico obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
    }

    private TipoServico tipoServicoAtivo(Integer id) {
        TipoServico tipo = repositorioTipoServico.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de servico nao encontrado."));
        if (!tipo.isAtivo()) {
            throw new NegocioException("Tipo de servico inativo.");
        }
        return tipo;
    }

    private static void validarDatas(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && fim.isBefore(inicio)) {
            throw new NegocioException(
                    "A data de fim prevista nao pode ser anterior a data de inicio.");
        }
    }
}
