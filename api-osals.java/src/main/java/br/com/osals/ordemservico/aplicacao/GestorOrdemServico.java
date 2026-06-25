package br.com.osals.ordemservico.aplicacao;

import br.com.osals.anexo.aplicacao.GestorAnexo;
import br.com.osals.anexo.dominio.RepositorioAnexoOs;
import br.com.osals.cadastro.dominio.ContatoCliente;
import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.RepositorioContatoCliente;
import br.com.osals.cadastro.dominio.RepositorioEquipamento;
import br.com.osals.cadastro.dominio.RepositorioVeiculo;
import br.com.osals.cadastro.dominio.Veiculo;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.ordemservico.aplicacao.dto.AberturaOsRequisicao;
import br.com.osals.ordemservico.aplicacao.dto.DigitacaoExecucaoRequisicao;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResposta;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResumoDto;
import br.com.osals.ordemservico.dominio.EspecificacoesOrdemServico;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.ordemservico.dominio.RepositorioOrdemServico;
import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import br.com.osals.seguranca.dominio.RepositorioTecnico;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra o ciclo de vida da OS: abertura, impressao, digitacao e cancelamento.
 */
@Service
@Transactional(readOnly = true)
public class GestorOrdemServico {

    private static final Logger log = LoggerFactory.getLogger(GestorOrdemServico.class);

    private final RepositorioOrdemServico repositorio;
    private final RepositorioServico repositorioServico;
    private final RepositorioTecnico repositorioTecnico;
    private final RepositorioVeiculo repositorioVeiculo;
    private final RepositorioEquipamento repositorioEquipamento;
    private final RepositorioContatoCliente repositorioContato;
    private final RepositorioAnexoOs repositorioAnexoOs;
    private final GestorAnexo gestorAnexo;
    private final MapperOrdemServico mapper;

    public GestorOrdemServico(RepositorioOrdemServico repositorio,
                              RepositorioServico repositorioServico,
                              RepositorioTecnico repositorioTecnico,
                              RepositorioVeiculo repositorioVeiculo,
                              RepositorioEquipamento repositorioEquipamento,
                              RepositorioContatoCliente repositorioContato,
                              RepositorioAnexoOs repositorioAnexoOs,
                              GestorAnexo gestorAnexo,
                              MapperOrdemServico mapper) {
        this.repositorio = repositorio;
        this.repositorioServico = repositorioServico;
        this.repositorioTecnico = repositorioTecnico;
        this.repositorioVeiculo = repositorioVeiculo;
        this.repositorioEquipamento = repositorioEquipamento;
        this.repositorioContato = repositorioContato;
        this.repositorioAnexoOs = repositorioAnexoOs;
        this.gestorAnexo = gestorAnexo;
        this.mapper = mapper;
    }

    public PaginaResposta<OrdemServicoResumoDto> listar(StatusOrdemServico status, Long servicoId,
                                                        Long clienteId, String busca, Pageable pageable) {
        var spec = EspecificacoesOrdemServico.comFiltros(status, servicoId, clienteId, busca);
        var page = repositorio.findAll(spec, pageable);
        Set<Long> comAnexo = idsComAnexo(page.getContent());
        return PaginaResposta.de(page.map(os -> mapper.paraResumo(os, comAnexo.contains(os.getId()))));
    }

    public List<OrdemServicoResumoDto> listarDoServico(Long servicoId) {
        var lista = repositorio.findByServicoIdOrderByNumero(servicoId);
        Set<Long> comAnexo = idsComAnexo(lista);
        return lista.stream()
                .map(os -> mapper.paraResumo(os, comAnexo.contains(os.getId())))
                .toList();
    }

    /** os_ids da lista que possuem anexo (uma consulta — evita N+1 ao montar o resumo). */
    private Set<Long> idsComAnexo(Collection<OrdemServico> ordens) {
        if (ordens.isEmpty()) {
            return Set.of();
        }
        var ids = ordens.stream().map(OrdemServico::getId).toList();
        return new HashSet<>(repositorioAnexoOs.idsComAnexo(ids));
    }

    public OrdemServicoResposta buscarPorId(Long id) {
        return mapper.paraResposta(obrigatorio(id));
    }

    @Transactional
    public OrdemServicoResposta abrir(Long servicoId, AberturaOsRequisicao req, Usuario autor) {
        Servico servico = repositorioServico.findById(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
        if (servico.estaEncerrado()) {
            throw new NegocioException(
                    "Nao e possivel abrir OS para um Servico " + servico.getStatus().getRotulo().toLowerCase() + ".");
        }

        Set<Tecnico> tecnicos = resolverTecnicos(req.tecnicoIds());
        Set<Equipamento> equipamentos = resolverEquipamentos(req.equipamentoIds(), servico);
        Set<Veiculo> veiculos = resolverVeiculos(req.veiculoIds());
        Set<ContatoCliente> contatos = resolverContatos(req.contatoIds(), servico);

        int numero = repositorio.proximoNumero().intValue();
        var os = new OrdemServico(numero, servico, req.descricaoAtividade().trim(),
                req.dataAgendada(), autor);
        os.definirEquipe(tecnicos, veiculos, equipamentos);
        os.definirContatos(contatos);
        var salva = repositorio.save(os);
        log.info("OS aberta: id={} numero={} servico={}", salva.getId(), salva.getNumero(), servicoId);
        return mapper.paraResposta(salva);
    }

    @Transactional
    public OrdemServicoResposta editar(Long id, AberturaOsRequisicao req, Usuario autor) {
        var os = obrigatorio(id);
        if (os.estaEncerrada()) {
            throw new NegocioException(
                    "OS " + os.getStatus().getRotulo().toLowerCase() + " nao pode ser editada.");
        }
        Servico servico = os.getServico();
        Set<Tecnico> tecnicos = resolverTecnicos(req.tecnicoIds());
        Set<Equipamento> equipamentos = resolverEquipamentos(req.equipamentoIds(), servico);
        Set<Veiculo> veiculos = resolverVeiculos(req.veiculoIds());
        Set<ContatoCliente> contatos = resolverContatos(req.contatoIds(), servico);

        os.editarCabecalho(req.descricaoAtividade().trim(), req.dataAgendada());
        os.definirEquipe(tecnicos, veiculos, equipamentos);
        os.definirContatos(contatos);
        log.info("OS {} editada por usuario {}", id, autor.getId());
        return mapper.paraResposta(os);
    }

    @Transactional
    public void imprimir(Long id) {
        var os = obrigatorio(id);
        os.imprimir();
        log.info("OS {} marcada como impressa", id);
    }

    @Transactional
    public OrdemServicoResposta digitarExecucao(Long id, DigitacaoExecucaoRequisicao req, Usuario autor) {
        var os = obrigatorio(id);
        if (req.horaInicioExecucao() != null && req.horaFimExecucao() != null
                && req.horaFimExecucao().isBefore(req.horaInicioExecucao())) {
            throw new NegocioException("A hora de fim nao pode ser anterior a hora de inicio.");
        }
        os.digitarExecucao(
                req.horaInicioExecucao(), req.horaFimExecucao(),
                req.oQueFoiFeito().trim(),
                normalizar(req.observacoes()), normalizar(req.impedimentos()),
                autor);
        log.info("OS {} concluida via digitacao por usuario {}", id, autor.getId());
        return mapper.paraResposta(os);
    }

    @Transactional
    public OrdemServicoResposta marcarDevolvida(Long id) {
        var os = obrigatorio(id);
        os.marcarDevolvida();
        return mapper.paraResposta(os);
    }

    @Transactional
    public OrdemServicoResposta cancelar(Long id) {
        var os = obrigatorio(id);
        os.cancelar();
        log.info("OS {} cancelada", id);
        return mapper.paraResposta(os);
    }

    /**
     * Operacao administrativa: reabre uma OS CANCELADA voltando ao status
     * ABERTA. Endpoint restrito a ADMIN.
     */
    @Transactional
    public OrdemServicoResposta reabrirCancelada(Long id, Usuario autor) {
        var os = obrigatorio(id);
        os.reabrirCancelada();
        log.info("OS {} reaberta por usuario {} (admin)", id, autor.getId());
        return mapper.paraResposta(os);
    }

    /**
     * Operacao administrativa: apaga uma OS por completo (anexo + tabelas de
     * juncao via cascade SQL + a propria OS). Endpoint restrito a ADMIN.
     */
    @Transactional
    public void excluir(Long id, Usuario autor) {
        var os = obrigatorio(id);
        gestorAnexo.apagarAnexoDaOsSeExistir(id);
        repositorio.delete(os);
        log.info("OS {} (numero {}) excluida por usuario {} (admin)",
                id, os.getNumero(), autor.getId());
    }

    OrdemServico obrigatorio(Long id) {
        return repositorio.findWithRelacionamentosById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ordem de servico nao encontrada."));
    }

    private Set<Tecnico> resolverTecnicos(Set<Long> ids) {
        var encontrados = new LinkedHashSet<Tecnico>();
        for (Long id : ids) {
            Tecnico t = repositorioTecnico.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Tecnico nao encontrado: id=" + id));
            if (!t.getUsuario().isAtivo()) {
                throw new NegocioException("Tecnico inativo: " + t.getUsuario().getNome());
            }
            encontrados.add(t);
        }
        return encontrados;
    }

    private Set<Equipamento> resolverEquipamentos(Set<Long> ids, Servico servico) {
        var encontrados = new LinkedHashSet<Equipamento>();
        if (ids == null) {
            return encontrados;
        }
        Long clienteServico = servico.getCliente().getId();
        for (Long id : ids) {
            Equipamento e = repositorioEquipamento.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Equipamento nao encontrado: id=" + id));
            Long clienteEquip = e.getUnidade().getCliente().getId();
            if (!clienteEquip.equals(clienteServico)) {
                throw new NegocioException(
                        "Equipamento id=" + id + " nao pertence ao cliente do Servico.");
            }
            encontrados.add(e);
        }
        return encontrados;
    }

    private Set<Veiculo> resolverVeiculos(Set<Long> ids) {
        var encontrados = new LinkedHashSet<Veiculo>();
        if (ids == null) {
            return encontrados;
        }
        for (Long id : ids) {
            Veiculo v = repositorioVeiculo.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Veiculo nao encontrado: id=" + id));
            encontrados.add(v);
        }
        return encontrados;
    }

    private Set<ContatoCliente> resolverContatos(Set<Long> ids, Servico servico) {
        var encontrados = new LinkedHashSet<ContatoCliente>();
        if (ids == null) {
            return encontrados;
        }
        Long clienteServico = servico.getCliente().getId();
        for (Long id : ids) {
            ContatoCliente c = repositorioContato.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Contato nao encontrado: id=" + id));
            if (!c.getCliente().getId().equals(clienteServico)) {
                throw new NegocioException(
                        "Contato id=" + id + " nao pertence ao cliente do Servico.");
            }
            encontrados.add(c);
        }
        return encontrados;
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
