package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoPeca;
import br.com.osals.cadastro.aplicacao.dto.PecaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.PecaResposta;
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
@RequestMapping("/pecas")
@Tag(name = "Pecas", description = "Catalogo de pecas e materiais (sem estoque)")
public class ControladorPeca {

    private final ServicoPeca servico;

    public ControladorPeca(ServicoPeca servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    public ResponseEntity<PaginaResposta<PecaResposta>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listar(busca, apenasAtivos, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    public ResponseEntity<PecaResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<PecaResposta> criar(@Valid @RequestBody PecaRequisicao req) {
        var p = servico.criar(req);
        return ResponseEntity.created(URI.create("/pecas/" + p.id())).body(p);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<PecaResposta> atualizar(@PathVariable Long id, @Valid @RequestBody PecaRequisicao req) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        servico.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reativar")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        servico.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
