package br.com.osals.servico.api;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.GestorFaturamento;
import br.com.osals.servico.aplicacao.dto.FaturamentoResposta;
import br.com.osals.servico.aplicacao.dto.NotaFiscalRequisicao;
import br.com.osals.servico.aplicacao.dto.NotaFiscalResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Faturamento de um Servico: notas fiscais e o ciclo AGUARDANDO -> FECHADO.
 * Ver exige FATURAMENTO_VER; alterar NFs / fechar exige FATURAMENTO_EDITAR;
 * reabrir e' restrito a admin (SERVICO_EXCLUIR).
 */
@RestController
@RequestMapping("/servicos/{servicoId}")
@Tag(name = "Faturamento do Servico", description = "Notas fiscais e fechamento do faturamento")
public class ControladorFaturamento {

    private final GestorFaturamento gestor;

    public ControladorFaturamento(GestorFaturamento gestor) {
        this.gestor = gestor;
    }

    @GetMapping("/faturamento")
    @PreAuthorize("hasAuthority('FATURAMENTO_VER')")
    @Operation(summary = "Estado do faturamento: total das NFs, comparacao com o valor da cobranca e a lista.")
    public ResponseEntity<FaturamentoResposta> buscar(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.buscar(servicoId));
    }

    @PostMapping("/notas-fiscais")
    @PreAuthorize("hasAuthority('FATURAMENTO_EDITAR')")
    @Operation(summary = "Adiciona uma nota fiscal ao faturamento.")
    public ResponseEntity<NotaFiscalResposta> adicionar(
            @PathVariable Long servicoId,
            @Valid @RequestBody NotaFiscalRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        var nf = gestor.adicionar(servicoId, req, autor);
        return ResponseEntity
                .created(URI.create("/servicos/" + servicoId + "/notas-fiscais/" + nf.id()))
                .body(nf);
    }

    @PutMapping("/notas-fiscais/{nfId}")
    @PreAuthorize("hasAuthority('FATURAMENTO_EDITAR')")
    @Operation(summary = "Edita uma nota fiscal.")
    public ResponseEntity<NotaFiscalResposta> editar(
            @PathVariable Long servicoId,
            @PathVariable Long nfId,
            @Valid @RequestBody NotaFiscalRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.editar(servicoId, nfId, req, autor));
    }

    @DeleteMapping("/notas-fiscais/{nfId}")
    @PreAuthorize("hasAuthority('FATURAMENTO_EDITAR')")
    @Operation(summary = "Exclui uma nota fiscal.")
    public ResponseEntity<Void> excluir(
            @PathVariable Long servicoId,
            @PathVariable Long nfId,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.excluir(servicoId, nfId, autor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/faturamento/fechar")
    @PreAuthorize("hasAuthority('FATURAMENTO_EDITAR')")
    @Operation(summary = "Fecha o faturamento. Exige soma das NFs igual ao valor da cobranca.")
    public ResponseEntity<FaturamentoResposta> fechar(
            @PathVariable Long servicoId,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.fechar(servicoId, autor));
    }

    @PostMapping("/faturamento/reabrir")
    @PreAuthorize("hasAuthority('SERVICO_EXCLUIR')")
    @Operation(summary = "Reabre um faturamento fechado. Apenas admin.")
    public ResponseEntity<FaturamentoResposta> reabrir(
            @PathVariable Long servicoId,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.reabrir(servicoId, autor));
    }
}
