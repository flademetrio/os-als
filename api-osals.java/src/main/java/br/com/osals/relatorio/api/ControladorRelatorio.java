package br.com.osals.relatorio.api;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.relatorio.aplicacao.GestorRelatorio;
import br.com.osals.relatorio.aplicacao.dto.CustosPorClienteItem;
import br.com.osals.relatorio.aplicacao.dto.CustosPorServicoItem;
import br.com.osals.relatorio.aplicacao.dto.OsPorStatusRelatorio;
import br.com.osals.servico.dominio.StatusServico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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

    public ControladorRelatorio(GestorRelatorio gestor) {
        this.gestor = gestor;
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

    @GetMapping("/custos-por-cliente")
    @Operation(summary = "Volume consolidado por cliente: servicos, OS, custo e preco de venda.")
    public ResponseEntity<List<CustosPorClienteItem>> custosPorCliente(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(gestor.custosPorCliente(inicio, fim));
    }
}
