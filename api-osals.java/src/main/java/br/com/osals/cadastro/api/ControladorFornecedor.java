package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoFornecedor;
import br.com.osals.cadastro.aplicacao.dto.FornecedorRequisicao;
import br.com.osals.cadastro.aplicacao.dto.FornecedorResposta;
import br.com.osals.compartilhado.api.PaginaResposta;
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
@RequestMapping("/fornecedores")
@Tag(name = "Fornecedores", description = "Cadastro de fornecedores")
public class ControladorFornecedor {

    private final ServicoFornecedor servico;

    public ControladorFornecedor(ServicoFornecedor servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FORNECEDOR_VER')")
    public ResponseEntity<PaginaResposta<FornecedorResposta>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listar(busca, apenasAtivos, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('FORNECEDOR_VER')")
    public ResponseEntity<FornecedorResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FORNECEDOR_GERENCIAR')")
    public ResponseEntity<FornecedorResposta> criar(@Valid @RequestBody FornecedorRequisicao req) {
        var f = servico.criar(req);
        return ResponseEntity.created(URI.create("/fornecedores/" + f.id())).body(f);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('FORNECEDOR_GERENCIAR')")
    public ResponseEntity<FornecedorResposta> atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorRequisicao req) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('FORNECEDOR_GERENCIAR')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        servico.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reativar")
    @PreAuthorize("hasAuthority('FORNECEDOR_GERENCIAR')")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        servico.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
