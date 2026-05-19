package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoVeiculo;
import br.com.osals.cadastro.aplicacao.dto.VeiculoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResposta;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResumoDto;
import br.com.osals.cadastro.dominio.StatusVeiculo;
import br.com.osals.compartilhado.api.PaginaResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/veiculos")
@Tag(name = "Veiculos", description = "Frota de veiculos da empresa")
public class ControladorVeiculo {

    private final ServicoVeiculo servico;

    public ControladorVeiculo(ServicoVeiculo servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista veiculos com filtros opcionais.")
    public ResponseEntity<PaginaResposta<VeiculoResumoDto>> listar(
            @RequestParam(required = false) StatusVeiculo status,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listar(status, busca, apenasAtivos, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VeiculoResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cria novo veiculo. Placa unica, formato Mercosul ou antigo.")
    public ResponseEntity<VeiculoResposta> criar(@Valid @RequestBody VeiculoRequisicao req) {
        var v = servico.criar(req);
        return ResponseEntity.created(URI.create("/veiculos/" + v.id())).body(v);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VeiculoResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody VeiculoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        servico.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reativar")
    @PreAuthorize("hasAnyRole('GERENTE','ADMIN')")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        servico.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
