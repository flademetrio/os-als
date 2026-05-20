package br.com.osals.servico.api;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.GestorLancamentoCusto;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoRequisicao;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoResposta;
import br.com.osals.servico.aplicacao.dto.ResumoFinanceiroServico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
 * Endpoints de custos de um Servico e resumo financeiro.
 *
 * Lancar/editar/excluir e permitido a operador, gerente e admin enquanto o
 * Servico nao esta encerrado; apos encerrado, somente gerente e admin
 * (regra aplicada no GestorLancamentoCusto — operador recebe 403).
 */
@RestController
@RequestMapping("/servicos/{servicoId}")
@Tag(name = "Custos do Servico", description = "Lancamentos de custo e calculo do preco de venda")
public class ControladorLancamentoCusto {

    private final GestorLancamentoCusto gestor;

    public ControladorLancamentoCusto(GestorLancamentoCusto gestor) {
        this.gestor = gestor;
    }

    @GetMapping("/custos")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista os lancamentos de custo do Servico.")
    public ResponseEntity<List<LancamentoCustoResposta>> listar(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.listar(servicoId));
    }

    @PostMapping("/custos")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lanca um custo. Mao de obra e deslocamento sao calculados pelo sistema.")
    public ResponseEntity<LancamentoCustoResposta> lancar(
            @PathVariable Long servicoId,
            @Valid @RequestBody LancamentoCustoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        var c = gestor.lancar(servicoId, req, autor);
        return ResponseEntity
                .created(URI.create("/servicos/" + servicoId + "/custos/" + c.id()))
                .body(c);
    }

    @PutMapping("/custos/{custoId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Edita um lancamento de custo.")
    public ResponseEntity<LancamentoCustoResposta> editar(
            @PathVariable Long servicoId,
            @PathVariable Long custoId,
            @Valid @RequestBody LancamentoCustoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.editar(servicoId, custoId, req, autor));
    }

    @DeleteMapping("/custos/{custoId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Exclui um lancamento de custo.")
    public ResponseEntity<Void> excluir(
            @PathVariable Long servicoId,
            @PathVariable Long custoId,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.excluir(servicoId, custoId, autor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumo-financeiro")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Custo agregado por categoria, custo total, markup e preco de venda.")
    public ResponseEntity<ResumoFinanceiroServico> resumoFinanceiro(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.calcularResumoFinanceiro(servicoId));
    }
}
