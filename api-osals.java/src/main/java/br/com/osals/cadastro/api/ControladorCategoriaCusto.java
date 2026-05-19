package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoCategoriaCusto;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoCategoriaCustoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CategoriaCustoResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Apenas admin altera. Lista fechada — sem POST/DELETE (decisao V1):
 * cada categoria esta acoplada a logica de calculo (ESTRUTURADO_MAO_OBRA etc).
 */
@RestController
@RequestMapping("/categorias-custo")
@Tag(name = "Categorias de Custo", description = "5 categorias fixas (renomear/ativar apenas)")
public class ControladorCategoriaCusto {

    private final ServicoCategoriaCusto servico;

    public ControladorCategoriaCusto(ServicoCategoriaCusto servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CategoriaCustoResposta>> listar(
            @RequestParam(defaultValue = "true") boolean apenasAtivos
    ) {
        return ResponseEntity.ok(servico.listar(apenasAtivos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Renomeia e/ou ativa/desativa categoria. Apenas admin. Codigo e tipo sao imutaveis.")
    public ResponseEntity<CategoriaCustoResposta> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizacaoCategoriaCustoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }
}
