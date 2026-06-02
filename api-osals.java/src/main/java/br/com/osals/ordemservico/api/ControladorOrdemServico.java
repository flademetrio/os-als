package br.com.osals.ordemservico.api;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.impressao.aplicacao.GeradorPdfOS;
import br.com.osals.ordemservico.aplicacao.GestorOrdemServico;
import br.com.osals.ordemservico.aplicacao.dto.AberturaOsRequisicao;
import br.com.osals.ordemservico.aplicacao.dto.DigitacaoExecucaoRequisicao;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResposta;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResumoDto;
import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints da Ordem de Servico. Abertura, listagem, impressao (PDF),
 * digitacao da execucao e cancelamento.
 * Disponivel a operador, gerente e admin (ver documentacao/10).
 */
@RestController
@Tag(name = "Ordens de Servico", description = "Atividades operacionais dentro de um Servico")
public class ControladorOrdemServico {

    private final GestorOrdemServico gestor;
    private final GeradorPdfOS geradorPdf;

    public ControladorOrdemServico(GestorOrdemServico gestor, GeradorPdfOS geradorPdf) {
        this.gestor = gestor;
        this.geradorPdf = geradorPdf;
    }

    @PostMapping("/servicos/{servicoId}/ordens-servico")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Abre uma OS dentro de um Servico. Numero sequencial atribuido pelo sistema.")
    public ResponseEntity<OrdemServicoResposta> abrir(
            @PathVariable Long servicoId,
            @Valid @RequestBody AberturaOsRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        var os = gestor.abrir(servicoId, req, autor);
        return ResponseEntity.created(URI.create("/ordens-servico/" + os.id())).body(os);
    }

    @GetMapping("/servicos/{servicoId}/ordens-servico")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista as OS de um Servico.")
    public ResponseEntity<List<OrdemServicoResumoDto>> listarDoServico(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.listarDoServico(servicoId));
    }

    @GetMapping("/ordens-servico")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista OS com filtros (status, servico, cliente) e paginacao.")
    public ResponseEntity<PaginaResposta<OrdemServicoResumoDto>> listar(
            @RequestParam(required = false) StatusOrdemServico status,
            @RequestParam(required = false) Long servicoId,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String busca,
            Pageable pageable
    ) {
        return ResponseEntity.ok(gestor.listar(status, servicoId, clienteId, busca, pageable));
    }

    @GetMapping("/ordens-servico/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrdemServicoResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(gestor.buscarPorId(id));
    }

    @PostMapping("/ordens-servico/{id}/imprimir")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marca a OS como impressa e retorna o PDF para impressao.")
    public ResponseEntity<byte[]> imprimir(@PathVariable Long id) {
        gestor.imprimir(id);
        byte[] pdf = geradorPdf.gerar(id);
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("os-" + id + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/ordens-servico/{id}/digitar-execucao")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Registra os dados de execucao preenchidos pela equipe e conclui a OS.")
    public ResponseEntity<OrdemServicoResposta> digitarExecucao(
            @PathVariable Long id,
            @Valid @RequestBody DigitacaoExecucaoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.digitarExecucao(id, req, autor));
    }

    @PostMapping("/ordens-servico/{id}/marcar-devolvida")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marca que o papel preenchido voltou e aguarda digitacao.")
    public ResponseEntity<OrdemServicoResposta> marcarDevolvida(@PathVariable Long id) {
        return ResponseEntity.ok(gestor.marcarDevolvida(id));
    }

    @PostMapping("/ordens-servico/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancela a OS. Encerramento alternativo.")
    public ResponseEntity<OrdemServicoResposta> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(gestor.cancelar(id));
    }

    @PostMapping("/ordens-servico/{id}/reabrir")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reabre uma OS cancelada (status volta a ABERTA). Apenas admin.")
    public ResponseEntity<OrdemServicoResposta> reabrir(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.reabrirCancelada(id, autor));
    }

    @DeleteMapping("/ordens-servico/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exclui permanentemente uma OS (com anexo). Apenas admin.")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.excluir(id, autor);
        return ResponseEntity.noContent().build();
    }
}
