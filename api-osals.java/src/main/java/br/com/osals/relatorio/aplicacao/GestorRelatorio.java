package br.com.osals.relatorio.aplicacao;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.configuracao.aplicacao.ServicoConfiguracao;
import br.com.osals.configuracao.dominio.ChavesConfiguracao;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import br.com.osals.relatorio.aplicacao.dto.CustosPorClienteItem;
import br.com.osals.relatorio.aplicacao.dto.CustosPorServicoItem;
import br.com.osals.relatorio.aplicacao.dto.OsPorStatusRelatorio;
import br.com.osals.relatorio.aplicacao.dto.OsPorStatusRelatorio.ContagemStatus;
import br.com.osals.relatorio.aplicacao.dto.OsPorStatusRelatorio.OsItem;
import br.com.osals.relatorio.aplicacao.dto.ServicoAbertoItem;
import br.com.osals.relatorio.infraestrutura.ConsultasRelatorio;
import br.com.osals.servico.dominio.Servico;
import br.com.osals.servico.dominio.StatusServico;
import br.com.osals.servico.dominio.TipoCobranca;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gera os 3 relatorios da V1 (ver documentacao/11-relatorios.md).
 * Acesso restrito a gerente e admin — controlado no controller.
 */
@Service
@Transactional(readOnly = true)
public class GestorRelatorio {

    private static final BigDecimal CEM = new BigDecimal("100");

    private final ConsultasRelatorio consultas;
    private final ServicoConfiguracao servicoConfiguracao;

    public GestorRelatorio(ConsultasRelatorio consultas, ServicoConfiguracao servicoConfiguracao) {
        this.consultas = consultas;
        this.servicoConfiguracao = servicoConfiguracao;
    }

    // ===== OS por Status =====

    public OsPorStatusRelatorio osPorStatus(LocalDate inicio, LocalDate fim, Long clienteId,
                                            Long tecnicoId, Integer tipoServicoId,
                                            int pagina, int tamanho) {
        OffsetDateTime ini = inicioDoDia(inicio);
        OffsetDateTime fimEx = fimExclusivo(fim);

        var contagemBruta = new HashMap<StatusOrdemServico, Long>();
        for (Object[] linha : consultas.contarOsPorStatus(ini, fimEx, clienteId, tecnicoId, tipoServicoId)) {
            contagemBruta.put((StatusOrdemServico) linha[0], (Long) linha[1]);
        }
        var contagem = new ArrayList<ContagemStatus>();
        for (StatusOrdemServico s : StatusOrdemServico.values()) {
            contagem.add(new ContagemStatus(s, s.getRotulo(), contagemBruta.getOrDefault(s, 0L)));
        }

        long total = consultas.contarOs(ini, fimEx, clienteId, tecnicoId, tipoServicoId);
        var ordens = consultas.listarOs(ini, fimEx, clienteId, tecnicoId, tipoServicoId, pagina, tamanho);
        var itens = ordens.stream().map(GestorRelatorio::paraOsItem).toList();

        int totalPaginas = tamanho > 0 ? (int) Math.ceil((double) total / tamanho) : 0;
        var pagina_ = new PaginaResposta<>(itens, pagina, tamanho, total, totalPaginas);
        return new OsPorStatusRelatorio(contagem, total, pagina_);
    }

    private static OsItem paraOsItem(OrdemServico os) {
        Servico s = os.getServico();
        String tecnicos = os.getTecnicos().stream()
                .map(t -> t.getUsuario().getNome())
                .collect(Collectors.joining(", "));
        return new OsItem(
                os.getId(),
                String.format("%04d-%05d", s.getNumero(), os.getNumero()),
                s.getId(),
                s.getCliente().getId(),
                s.getCliente().getNome(),
                tecnicos,
                os.getDataAbertura(),
                s.getDataFimPrevista(),
                os.getStatus(),
                os.getStatus().getRotulo()
        );
    }

    // ===== Custos por Servico =====

    public PaginaResposta<CustosPorServicoItem> custosPorServico(LocalDate inicio, LocalDate fim,
                                                                 Long clienteId, Integer tipoServicoId,
                                                                 StatusServico status,
                                                                 int pagina, int tamanho) {
        OffsetDateTime ini = inicioDoDia(inicio);
        OffsetDateTime fimEx = fimExclusivo(fim);

        long total = consultas.contarServicos(ini, fimEx, clienteId, tipoServicoId, status);
        var servicos = consultas.listarServicos(ini, fimEx, clienteId, tipoServicoId, status, pagina, tamanho);
        var ids = servicos.stream().map(Servico::getId).toList();

        // servicoId -> (categoriaCodigo -> soma)
        var custos = new HashMap<Long, Map<String, Long>>();
        for (Object[] linha : consultas.somarCustosPorServicoECategoria(ids)) {
            custos.computeIfAbsent((Long) linha[0], k -> new HashMap<>())
                    .put((String) linha[1], (Long) linha[2]);
        }

        BigDecimal markup = servicoConfiguracao.buscarBigDecimal(ChavesConfiguracao.MARKUP_PERCENTUAL);
        var itens = new ArrayList<CustosPorServicoItem>();
        for (Servico s : servicos) {
            Map<String, Long> porCategoria = custos.getOrDefault(s.getId(), Map.of());
            long maoObra = porCategoria.getOrDefault("MAO_OBRA", 0L);
            long deslocamento = porCategoria.getOrDefault("DESLOCAMENTO", 0L);
            long pecas = porCategoria.getOrDefault("PECAS", 0L);
            long terceiros = porCategoria.getOrDefault("TERCEIROS", 0L);
            long hospedagem = porCategoria.getOrDefault("HOSPEDAGEM", 0L);
            long custoTotal = maoObra + deslocamento + pecas + terceiros + hospedagem;
            itens.add(new CustosPorServicoItem(
                    s.getId(), s.getNumero(), String.format("%04d", s.getNumero()),
                    s.getCliente().getId(), s.getCliente().getNome(), s.getDescricao(),
                    s.getStatus(), s.getStatus().getRotulo(),
                    maoObra, deslocamento, pecas, terceiros, hospedagem,
                    custoTotal, markup, aplicarMarkup(custoTotal, markup)));
        }

        int totalPaginas = tamanho > 0 ? (int) Math.ceil((double) total / tamanho) : 0;
        return new PaginaResposta<>(itens, pagina, tamanho, total, totalPaginas);
    }

    // ===== Servicos Abertos =====

    public List<ServicoAbertoItem> servicosAbertos(Long clienteId, Integer tipoServicoId) {
        var servicos = consultas.listarServicosAbertos(clienteId, tipoServicoId);
        var ids = servicos.stream().map(Servico::getId).toList();

        var osPorServico = new HashMap<Long, Long>();
        for (Object[] linha : consultas.contarOsPorServico(ids)) {
            osPorServico.put((Long) linha[0], (Long) linha[1]);
        }
        var cobrancaPorServico = new HashMap<Long, Object[]>(); // servicoId -> [tipo, valorCentavos]
        for (Object[] linha : consultas.cobrancasPorServico(ids)) {
            cobrancaPorServico.put((Long) linha[0], new Object[]{linha[1], linha[2]});
        }

        var itens = new ArrayList<ServicoAbertoItem>();
        for (Servico s : servicos) {
            Object[] cobranca = cobrancaPorServico.get(s.getId());
            boolean cobrado = cobranca != null && cobranca[0] == TipoCobranca.COBRADO;
            Long valor = cobrado ? (Long) cobranca[1] : null;
            itens.add(new ServicoAbertoItem(
                    s.getId(), s.getNumero(), String.format("%04d", s.getNumero()),
                    s.getCliente().getId(), s.getCliente().getNome(),
                    s.getTipoServico().getNome(), s.getDescricao(),
                    s.getStatus().getRotulo(),
                    cobrado, osPorServico.getOrDefault(s.getId(), 0L), valor));
        }
        return itens;
    }

    // ===== Custos por Cliente =====

    public List<CustosPorClienteItem> custosPorCliente(LocalDate inicio, LocalDate fim) {
        OffsetDateTime ini = inicioDoDia(inicio);
        OffsetDateTime fimEx = fimExclusivo(fim);

        var osPorCliente = new HashMap<Long, Long>();
        for (Object[] linha : consultas.contarOsPorCliente(ini, fimEx)) {
            osPorCliente.put((Long) linha[0], (Long) linha[1]);
        }
        var custoPorCliente = new HashMap<Long, Long>();
        for (Object[] linha : consultas.somarCustosPorCliente(ini, fimEx)) {
            custoPorCliente.put((Long) linha[0], (Long) linha[1]);
        }

        BigDecimal markup = servicoConfiguracao.buscarBigDecimal(ChavesConfiguracao.MARKUP_PERCENTUAL);
        var itens = new ArrayList<CustosPorClienteItem>();
        // a contagem de servicos define quais clientes aparecem (ja ordenada por nome)
        for (Object[] linha : consultas.contarServicosPorCliente(ini, fimEx)) {
            Long clienteId = (Long) linha[0];
            String nome = (String) linha[1];
            long qtdServicos = (Long) linha[2];
            long qtdOs = osPorCliente.getOrDefault(clienteId, 0L);
            long custoTotal = custoPorCliente.getOrDefault(clienteId, 0L);
            itens.add(new CustosPorClienteItem(
                    clienteId, nome, qtdServicos, qtdOs,
                    custoTotal, markup, aplicarMarkup(custoTotal, markup)));
        }
        return itens;
    }

    // ===== Helpers =====

    private static long aplicarMarkup(long custoTotalCentavos, BigDecimal markupPercentual) {
        BigDecimal fator = BigDecimal.ONE.add(markupPercentual.divide(CEM));
        return BigDecimal.valueOf(custoTotalCentavos).multiply(fator)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private static OffsetDateTime inicioDoDia(LocalDate d) {
        return d == null ? null : d.atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime();
    }

    private static OffsetDateTime fimExclusivo(LocalDate d) {
        return d == null ? null : d.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime();
    }
}
