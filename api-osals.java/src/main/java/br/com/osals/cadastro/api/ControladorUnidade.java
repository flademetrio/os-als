package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoUnidade;
import br.com.osals.cadastro.aplicacao.dto.UnidadeRequisicao;
import br.com.osals.cadastro.aplicacao.dto.UnidadeResposta;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Unidades", description = "Unidades/filiais dos clientes")
public class ControladorUnidade {

    private final ServicoUnidade servico;

    public ControladorUnidade(ServicoUnidade servico) {
        this.servico = servico;
    }

    @GetMapping("/clientes/{clienteId}/unidades")
    @PreAuthorize("hasAuthority('CLIENTE_VER')")
    public ResponseEntity<List<UnidadeResposta>> listar(
            @PathVariable Long clienteId,
            @RequestParam(defaultValue = "true") boolean apenasAtivas
    ) {
        return ResponseEntity.ok(servico.listarDoCliente(clienteId, apenasAtivas));
    }

    @PostMapping("/clientes/{clienteId}/unidades")
    @PreAuthorize("hasAuthority('CLIENTE_GERENCIAR')")
    @Operation(summary = "Cria nova unidade vinculada ao cliente.")
    public ResponseEntity<UnidadeResposta> criar(
            @PathVariable Long clienteId,
            @Valid @RequestBody UnidadeRequisicao req
    ) {
        var u = servico.criar(clienteId, req);
        return ResponseEntity.created(URI.create("/unidades/" + u.id())).body(u);
    }

    @GetMapping("/unidades/{id}")
    @PreAuthorize("hasAuthority('CLIENTE_VER')")
    public ResponseEntity<UnidadeResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PutMapping("/unidades/{id}")
    @PreAuthorize("hasAuthority('CLIENTE_GERENCIAR')")
    public ResponseEntity<UnidadeResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UnidadeRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/unidades/{id}")
    @PreAuthorize("hasAuthority('CLIENTE_GERENCIAR')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        servico.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
