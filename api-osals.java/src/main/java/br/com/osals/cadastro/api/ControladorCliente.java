package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoCliente;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoClienteRequisicao;
import br.com.osals.cadastro.aplicacao.dto.ClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.ClienteResumoDto;
import br.com.osals.cadastro.aplicacao.dto.CriacaoClienteRequisicao;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clientes")
@Tag(name = "Clientes", description = "Cadastro de clientes (PF/PJ)")
public class ControladorCliente {

    private final ServicoCliente servico;

    public ControladorCliente(ServicoCliente servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista clientes com busca opcional e paginacao.")
    public ResponseEntity<PaginaResposta<ClienteResumoDto>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listar(busca, apenasAtivos, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClienteResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cria novo cliente.")
    public ResponseEntity<ClienteResposta> criar(
            @Valid @RequestBody CriacaoClienteRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        var c = servico.criar(req, autor);
        return ResponseEntity.created(URI.create("/clientes/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClienteResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizacaoClienteRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req, autor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    @Operation(summary = "Inativa cliente (soft delete). Apenas gerente ou admin.")
    public ResponseEntity<Void> inativar(@PathVariable Long id, @AuthenticationPrincipal Usuario autor) {
        servico.inativar(id, autor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reativar")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<Void> reativar(@PathVariable Long id, @AuthenticationPrincipal Usuario autor) {
        servico.reativar(id, autor);
        return ResponseEntity.noContent().build();
    }
}
