package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoEquipamento;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResposta;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResumoDto;
import br.com.osals.cadastro.dominio.StatusEquipamento;
import br.com.osals.cadastro.dominio.TipoEquipamento;
import br.com.osals.compartilhado.api.PaginaResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Pageable;
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
@Tag(name = "Equipamentos", description = "Equipamentos de climatizacao instalados nas unidades dos clientes")
public class ControladorEquipamento {

    private final ServicoEquipamento servico;

    public ControladorEquipamento(ServicoEquipamento servico) {
        this.servico = servico;
    }

    @GetMapping("/unidades/{unidadeId}/equipamentos")
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    @Operation(summary = "Lista equipamentos de uma unidade.")
    public ResponseEntity<List<EquipamentoResposta>> listarDaUnidade(
            @PathVariable Long unidadeId,
            @RequestParam(defaultValue = "true") boolean apenasAtivos
    ) {
        return ResponseEntity.ok(servico.listarDaUnidade(unidadeId, apenasAtivos));
    }

    @PostMapping("/unidades/{unidadeId}/equipamentos")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    @Operation(summary = "Cria equipamento vinculado a uma unidade.")
    public ResponseEntity<EquipamentoResposta> criar(
            @PathVariable Long unidadeId,
            @Valid @RequestBody EquipamentoRequisicao req
    ) {
        var e = servico.criar(unidadeId, req);
        return ResponseEntity.created(URI.create("/equipamentos/" + e.id())).body(e);
    }

    @GetMapping("/equipamentos")
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    @Operation(summary = "Lista equipamentos filtrada por cliente, unidade, tipo, status ou busca textual.")
    public ResponseEntity<PaginaResposta<EquipamentoResumoDto>> listar(
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) TipoEquipamento tipo,
            @RequestParam(required = false) StatusEquipamento status,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "true") boolean apenasAtivos,
            Pageable pageable
    ) {
        return ResponseEntity.ok(servico.listarFiltrado(clienteId, unidadeId, tipo, status, busca, apenasAtivos, pageable));
    }

    @GetMapping("/equipamentos/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_VER')")
    public ResponseEntity<EquipamentoResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PutMapping("/equipamentos/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<EquipamentoResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EquipamentoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/equipamentos/{id}")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        servico.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/equipamentos/{id}/reativar")
    @PreAuthorize("hasAuthority('CADASTRO_GERENCIAR')")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        servico.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
