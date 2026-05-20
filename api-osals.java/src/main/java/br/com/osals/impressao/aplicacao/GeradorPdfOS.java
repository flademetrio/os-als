package br.com.osals.impressao.aplicacao;

import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.Unidade;
import br.com.osals.cadastro.dominio.Veiculo;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.ordemservico.dominio.RepositorioOrdemServico;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.servico.dominio.Servico;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Gera o PDF da OS impressa: carrega OS + Servico + Cliente + Unidades +
 * Equipamentos + Tecnicos + Veiculos, renderiza o template Thymeleaf e
 * converte para PDF com OpenHTMLtoPDF.
 *
 * Ver layout em documentacao/12-impressao-os.md.
 */
@Service
public class GeradorPdfOS {

    private static final Logger log = LoggerFactory.getLogger(GeradorPdfOS.class);
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RepositorioOrdemServico repositorio;
    private final TemplateEngine templateEnginePdf;
    private final PropriedadesEmpresa empresa;

    public GeradorPdfOS(RepositorioOrdemServico repositorio,
                        TemplateEngine templateEnginePdf,
                        PropriedadesEmpresa empresa) {
        this.repositorio = repositorio;
        this.templateEnginePdf = templateEnginePdf;
        this.empresa = empresa;
    }

    @Transactional(readOnly = true)
    public byte[] gerar(Long osId) {
        OrdemServico os = repositorio.findWithRelacionamentosById(osId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ordem de servico nao encontrada."));
        Servico servico = os.getServico();

        var ctx = new Context();
        ctx.setVariable("empresa", empresa);
        ctx.setVariable("codigo", String.format("%04d-%05d", servico.getNumero(), os.getNumero()));
        ctx.setVariable("servicoNumero", String.format("%04d", servico.getNumero()));
        ctx.setVariable("tipoServico", servico.getTipoServico().getNome());
        ctx.setVariable("dataAbertura", os.getDataAbertura().format(DATA));
        ctx.setVariable("clienteNome", servico.getCliente().getNome());
        ctx.setVariable("descricaoAtividade", os.getDescricaoAtividade());
        ctx.setVariable("unidades", unidades(os));
        ctx.setVariable("equipamentos", equipamentos(os));
        ctx.setVariable("tecnicos", tecnicos(os));
        ctx.setVariable("veiculos", veiculos(os));

        String html = templateEnginePdf.process("os-impressa", ctx);
        return renderizar(html, osId);
    }

    private static byte[] renderizar(String html, Long osId) {
        try (var saida = new ByteArrayOutputStream()) {
            var builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(saida);
            builder.run();
            byte[] pdf = saida.toByteArray();
            log.info("PDF da OS {} gerado: {} bytes", osId, pdf.length);
            return pdf;
        } catch (Exception e) {
            log.error("Falha ao gerar PDF da OS {}", osId, e);
            throw new NegocioException("Falha ao gerar o PDF da OS.");
        }
    }

    /** Unidades distintas dos equipamentos atendidos (identificacao + endereco). */
    private static List<Map<String, String>> unidades(OrdemServico os) {
        var porId = new LinkedHashMap<Long, Map<String, String>>();
        for (Equipamento e : os.getEquipamentos()) {
            Unidade u = e.getUnidade();
            porId.computeIfAbsent(u.getId(), k -> Map.of(
                    "identificacao", textoOuTraco(u.getIdentificacaoInterna()),
                    "endereco", enderecoCompleto(u)));
        }
        return new ArrayList<>(porId.values());
    }

    private static List<Map<String, String>> equipamentos(OrdemServico os) {
        var lista = new ArrayList<Map<String, String>>();
        for (Equipamento e : os.getEquipamentos()) {
            var item = new LinkedHashMap<String, String>();
            item.put("descricao", juntar(" ", e.getMarca(), e.getModelo()));
            item.put("numeroSerie", textoOuTraco(e.getNumeroSerie()));
            item.put("localizacao", textoOuTraco(e.getLocalizacaoInterna()));
            lista.add(item);
        }
        return lista;
    }

    private static List<String> tecnicos(OrdemServico os) {
        var lista = new ArrayList<String>();
        for (Tecnico t : os.getTecnicos()) {
            lista.add(t.getUsuario().getNome());
        }
        return lista;
    }

    private static List<String> veiculos(OrdemServico os) {
        var lista = new ArrayList<String>();
        for (Veiculo v : os.getVeiculos()) {
            lista.add(juntar(" ", v.getPlaca(), juntar(" ", v.getMarca(), v.getModelo())));
        }
        return lista;
    }

    private static String enderecoCompleto(Unidade u) {
        String linha1 = juntar(", ", u.getLogradouro(), u.getNumero());
        String partes = juntar(" - ",
                linha1,
                u.getComplemento(),
                u.getBairro(),
                juntar("/", u.getCidade(), u.getEstado()),
                u.getCep());
        return partes.isBlank() ? "-" : partes;
    }

    /** Junta valores nao vazios com o separador, ignorando nulos/brancos. */
    private static String juntar(String separador, String... valores) {
        var sb = new StringBuilder();
        for (String v : valores) {
            if (v != null && !v.isBlank()) {
                if (sb.length() > 0) {
                    sb.append(separador);
                }
                sb.append(v.trim());
            }
        }
        return sb.toString();
    }

    private static String textoOuTraco(String s) {
        return (s == null || s.isBlank()) ? "-" : s.trim();
    }
}
