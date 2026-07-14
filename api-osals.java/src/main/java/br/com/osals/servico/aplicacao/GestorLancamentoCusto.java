package br.com.osals.servico.aplicacao;

import br.com.osals.cadastro.dominio.CategoriaCusto;
import br.com.osals.cadastro.dominio.RepositorioCategoriaCusto;
import br.com.osals.cadastro.dominio.TipoLancamentoCusto;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.configuracao.aplicacao.ServicoConfiguracao;
import br.com.osals.configuracao.dominio.ChavesConfiguracao;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.ordemservico.dominio.RepositorioOrdemServico;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.RepositorioTecnico;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoRequisicao;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoResposta;
import br.com.osals.servico.aplicacao.dto.LancamentoMaoDeObraRequisicao;
import br.com.osals.servico.aplicacao.dto.MaoDeObraReferencia;
import br.com.osals.servico.aplicacao.dto.MaoDeObraReferencia.OrdemDoDia;
import br.com.osals.servico.aplicacao.dto.MaoDeObraReferencia.TecnicoReferencia;
import br.com.osals.servico.aplicacao.dto.ResumoFinanceiroServico;
import br.com.osals.servico.aplicacao.dto.ResumoFinanceiroServico.CustoPorCategoria;
import br.com.osals.servico.dominio.LancamentoCusto;
import br.com.osals.servico.dominio.RepositorioLancamentoCusto;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra os lancamentos de custo de um Servico e o calculo do preco de venda.
 *
 * Regras de status: enquanto o Servico nao esta encerrado, qualquer papel
 * (operador, gerente, admin) lanca/edita/exclui. Apos encerrado (concluido ou
 * cancelado), somente gerente e admin — operador recebe 403.
 *
 * Snapshots: mao de obra copia o valor/hora do tecnico; deslocamento copia o
 * valor/km da configuracao. Alteracoes posteriores nesses valores nao afetam
 * lancamentos ja gravados.
 */
@Service
@Transactional(readOnly = true)
public class GestorLancamentoCusto {

    private static final Logger log = LoggerFactory.getLogger(GestorLancamentoCusto.class);
    private static final BigDecimal CEM = new BigDecimal("100");

    private final RepositorioLancamentoCusto repositorio;
    private final RepositorioServico repositorioServico;
    private final RepositorioCategoriaCusto repositorioCategoria;
    private final RepositorioTecnico repositorioTecnico;
    private final RepositorioOrdemServico repositorioOrdemServico;
    private final ServicoConfiguracao servicoConfiguracao;
    private final MapperLancamentoCusto mapper;

    public GestorLancamentoCusto(RepositorioLancamentoCusto repositorio,
                                 RepositorioServico repositorioServico,
                                 RepositorioCategoriaCusto repositorioCategoria,
                                 RepositorioTecnico repositorioTecnico,
                                 RepositorioOrdemServico repositorioOrdemServico,
                                 ServicoConfiguracao servicoConfiguracao,
                                 MapperLancamentoCusto mapper) {
        this.repositorio = repositorio;
        this.repositorioServico = repositorioServico;
        this.repositorioCategoria = repositorioCategoria;
        this.repositorioTecnico = repositorioTecnico;
        this.repositorioOrdemServico = repositorioOrdemServico;
        this.servicoConfiguracao = servicoConfiguracao;
        this.mapper = mapper;
    }

    public List<LancamentoCustoResposta> listar(Long servicoId) {
        servicoObrigatorio(servicoId);
        return repositorio.listarDoServico(servicoId).stream().map(mapper::paraResposta).toList();
    }

    /** Referencia para o lancamento de mao de obra numa data (pela data agendada da OS). */
    public MaoDeObraReferencia referenciaMaoDeObra(Long servicoId, LocalDate data) {
        servicoObrigatorio(servicoId);
        var osDoServico = repositorioOrdemServico.findByServicoIdAndDataAgendada(servicoId, data);

        // Tecnicos candidatos: os das OS deste servico no dia (distintos, na ordem).
        var candidatos = new LinkedHashMap<Long, Tecnico>();
        for (OrdemServico os : osDoServico) {
            for (Tecnico t : os.getTecnicos()) {
                candidatos.putIfAbsent(t.getUsuarioId(), t);
            }
        }
        if (candidatos.isEmpty()) {
            return new MaoDeObraReferencia(List.of());
        }

        var osDoDia = repositorioOrdemServico.buscarPorDataETecnicos(data, candidatos.keySet());
        var tecnicos = new ArrayList<TecnicoReferencia>();
        for (Tecnico t : candidatos.values()) {
            Long tid = t.getUsuarioId();
            var ordens = osDoDia.stream()
                    .filter(os -> os.getTecnicos().stream().anyMatch(x -> x.getUsuarioId().equals(tid)))
                    .map(os -> paraOrdemDoDia(os, servicoId))
                    .toList();
            tecnicos.add(new TecnicoReferencia(tid, t.getUsuario().getNome(),
                    t.getValorHoraCentavos(), ordens));
        }
        return new MaoDeObraReferencia(tecnicos);
    }

    /**
     * Lanca UM custo de mao de obra agregando os tecnicos selecionados: valor =
     * soma de (valor/hora de cada tecnico x horas), detalhe = nomes (1o nome)
     * separados por virgula + a jornada. Um lancamento por dia.
     */
    @Transactional
    public LancamentoCustoResposta lancarMaoDeObra(Long servicoId,
                                                   LancamentoMaoDeObraRequisicao req, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        validarPermissaoAlteracao(servico, autor);

        CategoriaCusto categoria = repositorioCategoria.findById(req.categoriaCustoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria de custo nao encontrada."));
        if (!categoria.isAtivo()) {
            throw new NegocioException("Categoria de custo inativa: " + categoria.getNome());
        }
        if (categoria.getTipoLancamento() != TipoLancamentoCusto.ESTRUTURADO_MAO_OBRA) {
            throw new NegocioException("Categoria selecionada nao e de mao de obra.");
        }

        long valorTotal = 0;
        var nomes = new ArrayList<String>();
        for (Long tecnicoId : req.tecnicoIds().stream().distinct().toList()) {
            Tecnico tecnico = repositorioTecnico.findById(tecnicoId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Tecnico nao encontrado: " + tecnicoId));
            valorTotal += multiplicar(req.horas(), tecnico.getValorHoraCentavos());
            nomes.add(primeiroNome(tecnico.getUsuario().getNome()));
        }
        String detalhe = String.join(", ", nomes) + " - " + rotuloHoras(req.horas());
        if (detalhe.length() > 255) {
            detalhe = detalhe.substring(0, 255);
        }

        var lancamento = new LancamentoCusto(servico, autor);
        lancamento.definirDataCusto(req.dataCusto());
        lancamento.aplicarMaoDeObraAgregada(categoria, detalhe, req.horas(), valorTotal);
        var salvo = repositorio.save(lancamento);
        log.info("Mao de obra lancada: servico={} tecnicos={} horas={} valor={}",
                servicoId, nomes.size(), req.horas(), valorTotal);
        return mapper.paraResposta(salvo);
    }

    @Transactional
    public LancamentoCustoResposta lancar(Long servicoId, LancamentoCustoRequisicao req, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        validarPermissaoAlteracao(servico, autor);

        var lancamento = new LancamentoCusto(servico, autor);
        aplicar(lancamento, req);
        var salvo = repositorio.save(lancamento);
        log.info("Custo lancado: id={} servico={} categoria={} valor={}",
                salvo.getId(), servicoId, req.categoriaCustoId(), salvo.getValorTotalCentavos());
        return mapper.paraResposta(salvo);
    }

    @Transactional
    public LancamentoCustoResposta editar(Long servicoId, Long custoId,
                                          LancamentoCustoRequisicao req, Usuario autor) {
        var lancamento = lancamentoObrigatorio(servicoId, custoId);
        validarPermissaoAlteracao(lancamento.getServico(), autor);
        aplicar(lancamento, req);
        lancamento.marcarAtualizadoPor(autor);
        log.info("Custo {} editado no servico {}", custoId, servicoId);
        return mapper.paraResposta(lancamento);
    }

    @Transactional
    public void excluir(Long servicoId, Long custoId, Usuario autor) {
        var lancamento = lancamentoObrigatorio(servicoId, custoId);
        validarPermissaoAlteracao(lancamento.getServico(), autor);
        repositorio.delete(lancamento);
        log.info("Custo {} excluido do servico {}", custoId, servicoId);
    }

    public ResumoFinanceiroServico calcularResumoFinanceiro(Long servicoId) {
        servicoObrigatorio(servicoId);
        var lancamentos = repositorio.listarDoServico(servicoId);

        var agregado = new LinkedHashMap<Integer, long[]>(); // categoriaId -> [subtotal, quantidade]
        var nomes = new LinkedHashMap<Integer, CategoriaCusto>();
        long custoTotal = 0;
        for (LancamentoCusto l : lancamentos) {
            CategoriaCusto cat = l.getCategoriaCusto();
            nomes.putIfAbsent(cat.getId(), cat);
            long[] acc = agregado.computeIfAbsent(cat.getId(), k -> new long[2]);
            acc[0] += l.getValorTotalCentavos();
            acc[1] += 1;
            custoTotal += l.getValorTotalCentavos();
        }

        var porCategoria = new ArrayList<CustoPorCategoria>();
        for (var entrada : agregado.entrySet()) {
            CategoriaCusto cat = nomes.get(entrada.getKey());
            porCategoria.add(new CustoPorCategoria(
                    cat.getId(), cat.getCodigo(), cat.getNome(),
                    (int) entrada.getValue()[1], entrada.getValue()[0]));
        }

        BigDecimal markup = servicoConfiguracao.buscarBigDecimal(ChavesConfiguracao.MARKUP_PERCENTUAL);
        long precoVenda = aplicarMarkup(custoTotal, markup);
        return new ResumoFinanceiroServico(servicoId, porCategoria, custoTotal, markup, precoVenda);
    }

    // --- Validacao + computo por categoria ---

    private void aplicar(LancamentoCusto lancamento, LancamentoCustoRequisicao req) {
        CategoriaCusto categoria = repositorioCategoria.findById(req.categoriaCustoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria de custo nao encontrada."));
        if (!categoria.isAtivo()) {
            throw new NegocioException("Categoria de custo inativa: " + categoria.getNome());
        }
        String descricao = normalizar(req.descricao());

        lancamento.definirDataCusto(req.dataCusto());

        switch (categoria.getTipoLancamento()) {
            case ESTRUTURADO_MAO_OBRA -> aplicarMaoDeObra(lancamento, categoria, descricao, req);
            case ESTRUTURADO_DESLOCAMENTO -> aplicarDeslocamento(lancamento, categoria, descricao, req);
            case LIVRE -> aplicarLivre(lancamento, categoria, descricao, req);
        }
    }

    private void aplicarMaoDeObra(LancamentoCusto lancamento, CategoriaCusto categoria,
                                  String descricao, LancamentoCustoRequisicao req) {
        // Lancamento agregado (varios tecnicos) nao tem tecnico unico: na edicao,
        // o valor total e o detalhe sao informados direto.
        if (req.tecnicoId() == null) {
            if (req.valorTotalCentavos() == null) {
                throw new NegocioException("Mao de obra exige tecnico e horas, ou o valor total.");
            }
            lancamento.aplicarMaoDeObraAgregada(categoria, descricao, req.horas(), req.valorTotalCentavos());
            return;
        }
        if (req.horas() == null) {
            throw new NegocioException("Mao de obra exige tecnico e horas.");
        }
        Tecnico tecnico = repositorioTecnico.findById(req.tecnicoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tecnico nao encontrado."));
        long valorHora = tecnico.getValorHoraCentavos();
        long valorTotal = multiplicar(req.horas(), valorHora);
        lancamento.aplicarMaoDeObra(categoria, descricao, tecnico, req.horas(), valorHora, valorTotal);
    }

    private void aplicarDeslocamento(LancamentoCusto lancamento, CategoriaCusto categoria,
                                     String descricao, LancamentoCustoRequisicao req) {
        if (req.km() == null) {
            throw new NegocioException("Deslocamento exige a quilometragem (km).");
        }
        long valorKm = servicoConfiguracao.buscarLong(ChavesConfiguracao.VALOR_KM_CENTAVOS);
        long valorTotal = multiplicar(req.km(), valorKm);
        lancamento.aplicarDeslocamento(categoria, descricao, req.km(), valorKm, valorTotal);
    }

    private void aplicarLivre(LancamentoCusto lancamento, CategoriaCusto categoria,
                              String descricao, LancamentoCustoRequisicao req) {
        if (req.valorTotalCentavos() == null) {
            throw new NegocioException("Esta categoria exige o valor total (valorTotalCentavos).");
        }
        lancamento.aplicarLivre(categoria, descricao, req.valorTotalCentavos());
    }

    /** quantidade x valorUnitario(centavos), arredondado para centavos inteiros. */
    private static long multiplicar(BigDecimal quantidade, long valorUnitarioCentavos) {
        return quantidade.multiply(BigDecimal.valueOf(valorUnitarioCentavos))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    /** preco_venda = custo x (1 + markup/100), arredondado para centavos inteiros. */
    private static long aplicarMarkup(long custoTotalCentavos, BigDecimal markupPercentual) {
        BigDecimal fator = BigDecimal.ONE.add(markupPercentual.divide(CEM));
        return BigDecimal.valueOf(custoTotalCentavos).multiply(fator)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    /**
     * O acesso base (CUSTO_EDITAR) ja foi validado pelo @PreAuthorize do
     * controller. Aqui aplicamos a regra de negocio extra: apos o Servico
     * encerrado, somente GERENTE e ADMIN podem alterar custos — qualquer outro
     * papel (inclusive COMPRAS) recebe 403.
     */
    private void validarPermissaoAlteracao(Servico servico, Usuario autor) {
        if (servico.estaEncerrado()
                && autor.getPapel() != Papel.GERENTE
                && autor.getPapel() != Papel.ADMIN) {
            throw new AccessDeniedException(
                    "Servico encerrado: apenas gerente ou admin podem alterar custos.");
        }
    }

    private Servico servicoObrigatorio(Long servicoId) {
        return repositorioServico.findById(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
    }

    private LancamentoCusto lancamentoObrigatorio(Long servicoId, Long custoId) {
        var lancamento = repositorio.findById(custoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lancamento de custo nao encontrado."));
        if (!lancamento.getServico().getId().equals(servicoId)) {
            throw new RecursoNaoEncontradoException("Lancamento nao pertence a este Servico.");
        }
        return lancamento;
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private OrdemDoDia paraOrdemDoDia(OrdemServico os, Long servicoIdReferencia) {
        Servico s = os.getServico();
        return new OrdemDoDia(
                os.getId(),
                String.format("%04d-%05d", s.getNumero(), os.getNumero()),
                s.getId(),
                s.getId().equals(servicoIdReferencia),
                s.getCliente().getNome(),
                os.getDescricaoAtividade(),
                os.getHoraInicioExecucao(),
                os.getHoraFimExecucao());
    }

    /** Rotulo da jornada para o detalhe: 9 -> "9h", 4.5 -> "4h30", 2.5 -> "2h30". */
    private static String rotuloHoras(BigDecimal horas) {
        int totalMin = horas.multiply(BigDecimal.valueOf(60)).setScale(0, RoundingMode.HALF_UP).intValueExact();
        int h = totalMin / 60;
        int m = totalMin % 60;
        return m == 0 ? h + "h" : h + "h" + String.format("%02d", m);
    }

    /** Primeiro nome (para o detalhe do custo de mao de obra). */
    private static String primeiroNome(String nome) {
        if (nome == null) return "";
        var t = nome.trim();
        if (t.isEmpty()) return "";
        int sp = t.indexOf(' ');
        return sp > 0 ? t.substring(0, sp) : t;
    }
}
