package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoTecnico;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTecnicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CriacaoTecnicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.RedefinicaoSenhaRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TecnicoResposta;
import br.com.osals.cadastro.aplicacao.dto.TecnicoResumoDto;
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
@RequestMapping("/tecnicos")
@Tag(name = "Tecnicos", description = "Equipe tecnica — usuarios do sistema com papel TECNICO e cadastro de valor/hora")
public class ControladorTecnico {

    private final ServicoTecnico servico;

    public ControladorTecnico(ServicoTecnico servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    @Operation(summary = "Lista tecnicos paginado com busca opcional.")
    public ResponseEntity<PaginaResposta<TecnicoResumoDto>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listar(busca, apenasAtivos, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    public ResponseEntity<TecnicoResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    @Operation(summary = "Cria tecnico (usuario+tecnico em transacao). Apenas gerente ou admin.")
    public ResponseEntity<TecnicoResposta> criar(@Valid @RequestBody CriacaoTecnicoRequisicao req) {
        var t = servico.criar(req);
        return ResponseEntity.created(URI.create("/tecnicos/" + t.id())).body(t);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<TecnicoResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizacaoTecnicoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @PutMapping("/{id}/senha")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    @Operation(summary = "Redefine senha do tecnico. Invalida sessoes vigentes.")
    public ResponseEntity<Void> redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody RedefinicaoSenhaRequisicao req
    ) {
        servico.redefinirSenha(id, req);
        return ResponseEntity.noContent().build();
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
