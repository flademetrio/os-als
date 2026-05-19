package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoTipoServico;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TipoServicoResposta;
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
 * Apenas admin altera. NAO ha POST/DELETE — lista e fechada (decisao V1).
 */
@RestController
@RequestMapping("/tipos-servico")
@Tag(name = "Tipos de Servico", description = "Lista configuravel (apenas renomear/ativar). Lista fechada — sem criacao via API")
public class ControladorTipoServico {

    private final ServicoTipoServico servico;

    public ControladorTipoServico(ServicoTipoServico servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TipoServicoResposta>> listar(
            @RequestParam(defaultValue = "true") boolean apenasAtivos
    ) {
        return ResponseEntity.ok(servico.listar(apenasAtivos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Renomeia e/ou ativa/desativa um tipo de servico. Apenas admin.")
    public ResponseEntity<TipoServicoResposta> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizacaoTipoServicoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }
}
