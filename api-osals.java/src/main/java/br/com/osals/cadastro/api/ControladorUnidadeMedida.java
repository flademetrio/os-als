package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoUnidadeMedida;
import br.com.osals.cadastro.aplicacao.dto.UnidadeMedidaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.UnidadeMedidaResposta;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/unidades-medida")
@Tag(name = "Unidades de medida", description = "Catalogo de unidades de medida (sigla + nome)")
public class ControladorUnidadeMedida {

    private final ServicoUnidadeMedida servico;

    public ControladorUnidadeMedida(ServicoUnidadeMedida servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UnidadeMedidaResposta>> listar() {
        return ResponseEntity.ok(servico.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UnidadeMedidaResposta> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    public ResponseEntity<UnidadeMedidaResposta> criar(@Valid @RequestBody UnidadeMedidaRequisicao req) {
        var u = servico.criar(req);
        return ResponseEntity.created(URI.create("/unidades-medida/" + u.id())).body(u);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    public ResponseEntity<UnidadeMedidaResposta> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UnidadeMedidaRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {
        servico.remover(id);
        return ResponseEntity.noContent().build();
    }
}
