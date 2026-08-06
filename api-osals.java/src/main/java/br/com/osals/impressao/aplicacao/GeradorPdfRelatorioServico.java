package br.com.osals.impressao.aplicacao;

import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.relatorio.aplicacao.GestorRelatorio;
import br.com.osals.relatorio.aplicacao.dto.RelatorioServicoCompleto;
import br.com.osals.relatorio.aplicacao.dto.RelatorioServicoCompleto.OrdemRelatorioItem;
import br.com.osals.servico.aplicacao.dto.CobrancaResposta;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoResposta;
import br.com.osals.servico.aplicacao.dto.NotaFiscalResposta;
import br.com.osals.servico.aplicacao.dto.ServicoResposta;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Gera o PDF do "dossie do servico" (relatorio completo): reaproveita o dossie
 * montado por {@link GestorRelatorio}, formata os campos e renderiza o template
 * Thymeleaf {@code templates-pdf/relatorio-servico.html} com OpenHTMLtoPDF.
 */
@Service
public class GeradorPdfRelatorioServico {

    private static final Logger log = LoggerFactory.getLogger(GeradorPdfRelatorioServico.class);
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private final GestorRelatorio gestorRelatorio;
    private final TemplateEngine templateEnginePdf;
    private final PropriedadesEmpresa empresa;

    public GeradorPdfRelatorioServico(GestorRelatorio gestorRelatorio,
                                      TemplateEngine templateEnginePdf,
                                      PropriedadesEmpresa empresa) {
        this.gestorRelatorio = gestorRelatorio;
        this.templateEnginePdf = templateEnginePdf;
        this.empresa = empresa;
    }

    @Transactional(readOnly = true)
    public byte[] gerar(Long servicoId) {
        RelatorioServicoCompleto d = gestorRelatorio.servicoCompleto(servicoId);

        var ctx = new Context();
        ctx.setVariable("empresa", empresa);
        ctx.setVariable("s", mapServico(d.servico()));
        ctx.setVariable("ordens", d.ordens().stream().map(GeradorPdfRelatorioServico::mapOrdem).toList());
        ctx.setVariable("custos", d.custos().stream().map(GeradorPdfRelatorioServico::mapCusto).toList());
        ctx.setVariable("custoTotal", reais(d.custoTotalCentavos()));
        ctx.setVariable("cob", mapCobranca(d.cobranca()));
        ctx.setVariable("fat", mapFaturamento(d));

        String html = templateEnginePdf.process("relatorio-servico", ctx);
        return renderizar(html, servicoId);
    }

    private static Map<String, Object> mapServico(ServicoResposta s) {
        var m = new LinkedHashMap<String, Object>();
        m.put("numero", s.numeroFormatado());
        m.put("cliente", s.clienteNome());
        m.put("tipo", s.tipoServicoNome());
        m.put("empresa", s.empresaRotulo());
        m.put("status", s.statusRotulo());
        m.put("inicio", data(s.dataInicioPrevista()));
        m.put("fim", data(s.dataFimPrevista()));
        m.put("aberto", dataHora(s.createdAt()));
        m.put("finalizado", s.finalizadoEm() == null ? "-"
                : dataHora(s.finalizadoEm()) + (s.finalizadoPorNome() != null ? " - " + s.finalizadoPorNome() : ""));
        m.put("descricao", traco(s.descricao()));
        return m;
    }

    private static Map<String, Object> mapOrdem(OrdemRelatorioItem o) {
        var m = new LinkedHashMap<String, Object>();
        m.put("codigo", o.codigoExibicao());
        m.put("data", o.dataAgendada() == null ? "sem data agendada" : data(o.dataAgendada()));
        m.put("status", o.statusRotulo());
        m.put("atividade", traco(o.descricaoAtividade()));
        m.put("feito", traco(o.oQueFoiFeito()));
        m.put("tecnicos", traco(o.tecnicos()));
        m.put("veiculos", traco(o.veiculos()));
        m.put("execucao", execucao(o));
        m.put("observacoes", nvl(o.observacoes()));
        m.put("impedimentos", nvl(o.impedimentos()));
        return m;
    }

    private static Map<String, Object> mapCusto(LancamentoCustoResposta l) {
        var m = new LinkedHashMap<String, Object>();
        m.put("data", data(l.dataCusto()));
        m.put("categoria", traco(l.categoriaNome()));
        String detalhe = l.descricao() != null ? l.descricao()
                : (l.tecnicoNome() != null ? l.tecnicoNome() : "-");
        m.put("detalhe", detalhe);
        m.put("valor", reais(l.valorTotalCentavos()));
        return m;
    }

    private static Map<String, Object> mapCobranca(CobrancaResposta c) {
        var m = new LinkedHashMap<String, Object>();
        m.put("tipo", traco(c.tipoRotulo()));
        m.put("valor", c.valorCentavos() != null ? reais(c.valorCentavos()) : "-");
        m.put("dias", c.diasPrevistos() != null ? String.valueOf(c.diasPrevistos()) : "-");
        m.put("pessoas", c.qtdePessoas() != null ? String.valueOf(c.qtdePessoas()) : "-");
        m.put("obs", nvl(c.obs()));
        return m;
    }

    private static Map<String, Object> mapFaturamento(RelatorioServicoCompleto d) {
        var f = d.faturamento();
        var notas = new ArrayList<Map<String, Object>>();
        for (NotaFiscalResposta nf : f.notas()) {
            var n = new LinkedHashMap<String, Object>();
            n.put("numero", nf.numero());
            n.put("data", data(nf.dataEmissao()));
            n.put("valor", reais(nf.valorCentavos()));
            notas.add(n);
        }
        var m = new LinkedHashMap<String, Object>();
        m.put("aplicavel", f.aplicavel());
        m.put("status", traco(f.statusRotulo()));
        m.put("totalNf", reais(f.totalNfCentavos()));
        m.put("notas", notas);
        return m;
    }

    private static byte[] renderizar(String html, Long servicoId) {
        try (var saida = new ByteArrayOutputStream()) {
            var builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(saida);
            builder.run();
            byte[] pdf = saida.toByteArray();
            log.info("PDF do dossie do servico {} gerado: {} bytes", servicoId, pdf.length);
            return pdf;
        } catch (Exception e) {
            log.error("Falha ao gerar PDF do dossie do servico {}", servicoId, e);
            throw new NegocioException("Falha ao gerar o PDF do dossie do servico.");
        }
    }

    private static String data(LocalDate d) {
        return d == null ? "-" : d.format(DATA);
    }

    private static String dataHora(OffsetDateTime t) {
        return t == null ? "-" : t.atZoneSameInstant(FUSO).format(DATA_HORA);
    }

    private static String execucao(OrdemRelatorioItem o) {
        if (o.horaInicioExecucao() == null || o.horaFimExecucao() == null) {
            return "-";
        }
        return o.horaInicioExecucao().atZoneSameInstant(FUSO).format(HORA)
                + " - " + o.horaFimExecucao().atZoneSameInstant(FUSO).format(HORA);
    }

    private static String reais(long centavos) {
        BigDecimal v = BigDecimal.valueOf(centavos).movePointLeft(2);
        return NumberFormat.getCurrencyInstance(PT_BR).format(v);
    }

    /** Vazio ("") quando ausente — para campos condicionais no template. */
    private static String nvl(String s) {
        return s == null ? "" : s.trim();
    }

    /** Traco ("-") quando ausente — para campos sempre exibidos. */
    private static String traco(String s) {
        return (s == null || s.isBlank()) ? "-" : s.trim();
    }
}
