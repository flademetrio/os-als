package br.com.osals.servico.api;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.GestorCobranca;
import br.com.osals.servico.aplicacao.dto.CobrancaRequisicao;
import br.com.osals.servico.aplicacao.dto.CobrancaResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cobranca de um Servico. Ver exige FATURAMENTO_VER; salvar exige
 * FATURAMENTO_EDITAR. Apos o Servico encerrado, somente gerente e admin alteram
 * (regra no GestorCobranca).
 */
@RestController
@RequestMapping("/servicos/{servicoId}")
@Tag(name = "Cobranca do Servico", description = "Tipo de cobranca, valor e dados do orcamento")
public class ControladorCobranca {

    private final GestorCobranca gestor;

    public ControladorCobranca(GestorCobranca gestor) {
        this.gestor = gestor;
    }

    @GetMapping("/cobranca")
    @PreAuthorize("hasAuthority('FATURAMENTO_VER')")
    @Operation(summary = "Busca a cobranca do Servico.")
    public ResponseEntity<CobrancaResposta> buscar(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.buscar(servicoId));
    }

    @PutMapping("/cobranca")
    @PreAuthorize("hasAuthority('FATURAMENTO_EDITAR')")
    @Operation(summary = "Salva a cobranca do Servico. Valor obrigatorio quando tipo = Cobrado.")
    public ResponseEntity<CobrancaResposta> salvar(
            @PathVariable Long servicoId,
            @Valid @RequestBody CobrancaRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.salvar(servicoId, req, autor));
    }
}
