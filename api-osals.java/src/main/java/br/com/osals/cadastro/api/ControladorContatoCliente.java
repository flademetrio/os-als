package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoContatoCliente;
import br.com.osals.cadastro.aplicacao.dto.ContatoClienteRequisicao;
import br.com.osals.cadastro.aplicacao.dto.ContatoClienteResposta;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Contatos do Cliente", description = "Contatos (PF) associados a um cliente")
public class ControladorContatoCliente {

    private final ServicoContatoCliente servico;

    public ControladorContatoCliente(ServicoContatoCliente servico) {
        this.servico = servico;
    }

    @GetMapping("/clientes/{clienteId}/contatos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ContatoClienteResposta>> listar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(servico.listarDoCliente(clienteId));
    }

    @PostMapping("/clientes/{clienteId}/contatos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContatoClienteResposta> criar(
            @PathVariable Long clienteId,
            @Valid @RequestBody ContatoClienteRequisicao req
    ) {
        var c = servico.criar(clienteId, req);
        return ResponseEntity.created(URI.create("/contatos/" + c.id())).body(c);
    }

    @PutMapping("/contatos/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContatoClienteResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ContatoClienteRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/contatos/{id}")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        servico.remover(id);
        return ResponseEntity.noContent().build();
    }
}
