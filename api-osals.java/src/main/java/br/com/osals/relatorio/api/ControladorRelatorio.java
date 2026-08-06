package br.com.osals.relatorio.api;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.impressao.aplicacao.GeradorPdfRelatorioServico;
import br.com.osals.relatorio.aplicacao.GestorRelatorio;
import br.com.osals.relatorio.aplicacao.dto.CustosPorClienteItem;
import br.com.osals.relatorio.aplicacao.dto.CustosPorServicoItem;
import br.com.osals.relatorio.aplicacao.dto.OsPorPeriodoItem;
import br.com.osals.relatorio.aplicacao.dto.OsPorStatusRelatorio;
import br.com.osals.relatorio.aplicacao.dto.RelatorioServicoCompleto;
import br.com.osals.relatorio.aplicacao.dto.ServicoAbertoItem;
import br.com.osals.servico.dominio.StatusServico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Relatorios da V1 (ver documentacao/11). Acesso restrito a gerente e admin —
 * operador recebe 403.
 */
@RestController
@RequestMapping("/relatorios")
@PreAuthorize("hasAuthority('RELATORIO_VER')")
@Tag(name = "Relatorios", description = "Relatorios agregados — somente gerente e admin")
public class ControladorRelatorio {

    private final GestorRelatorio gestor;
    private final GeradorPdfRelatorioServico geradorPdf;

    public ControladorRelatorio(GestorRelatorio gestor, GeradorPdfRelatorioServico geradorPdf) {
        this.gestor = gestor;
        this.geradorPdf = geradorPdf;
    }

    @GetMapping("/os-por-status")
    @Operation(summary = "OS agrupadas por status, com contagem e lista paginada.")
    public ResponseEntity<OsPorStatusRelatorio> osPorStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long tecnicoId,
            @RequestParam(required = false) Integer tipoServicoId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho
    ) {
        return ResponseEntity.ok(
                gestor.osPorStatus(inicio, fim, clienteId, tecnicoId, tipoServicoId, pagina, tamanho));
    }

    @GetMapping("/custos-por-servico")
    @Operation(summary = "Custo por categoria, total, markup e preco de venda de cada Servico.")
    public ResponseEntity<PaginaResposta<CustosPorServicoItem>> custosPorServico(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Integer tipoServicoId,
            @RequestParam(required = false) StatusServico status,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho
    ) {
        return ResponseEntity.ok(
                gestor.custosPorServico(inicio, fim, clienteId, tipoServicoId, status, pagina, tamanho));
    }

    @GetMapping("/servicos-abertos")
    @Operation(summary = "Servicos abertos (nao encerrados): cliente, tipo, cobranca, nº de OS e valor.")
    public ResponseEntity<List<ServicoAbertoItem>> servicosAbertos(
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Integer tipoServicoId
    ) {
        return ResponseEntity.ok(gestor.servicosAbertos(clienteId, tipoServicoId));
    }

    @GetMapping("/servico/{servicoId}")
    @Operation(summary = "Dossie completo de um servico: dados, OS, custos, cobranca e faturamento.")
    public ResponseEntity<RelatorioServicoCompleto> servicoCompleto(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.servicoCompleto(servicoId));
    }

    @GetMapping("/servico/{servicoId}/pdf")
    @Operation(summary = "PDF do dossie completo do servico.")
    public ResponseEntity<byte[]> servicoCompletoPdf(@PathVariable Long servicoId) {
        byte[] pdf = geradorPdf.gerar(servicoId);
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("dossie-servico-" + servicoId + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/os-por-periodo")
    @Operation(summary = "OS agendadas num periodo (pela data agendada), organizadas por data.")
    public ResponseEntity<List<OsPorPeriodoItem>> osPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(gestor.osPorPeriodo(inicio, fim));
    }

    @GetMapping("/custos-por-cliente")
    @Operation(summary = "Volume consolidado por cliente: servicos, OS, custo e preco de venda.")
    public ResponseEntity<List<CustosPorClienteItem>> custosPorCliente(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(gestor.custosPorCliente(inicio, fim));
    }
}
