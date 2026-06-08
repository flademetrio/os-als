package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoTipoServico;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CriacaoTipoServicoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.TipoServicoResposta;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lista de tipos de servico configuravel. Operadores apenas listam.
 * Admin pode criar, renomear, ativar/desativar e excluir (se nao estiver em uso).
 */
@RestController
@RequestMapping("/tipos-servico")
@Tag(name = "Tipos de Servico", description = "Configuracao da lista de tipos de servico")
public class ControladorTipoServico {

    private final ServicoTipoServico servico;

    public ControladorTipoServico(ServicoTipoServico servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SERVICO_VER')")
    public ResponseEntity<List<TipoServicoResposta>> listar(
            @RequestParam(defaultValue = "true") boolean apenasAtivos
    ) {
        return ResponseEntity.ok(servico.listar(apenasAtivos));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Cadastra um novo tipo de servico. Apenas admin.")
    public ResponseEntity<TipoServicoResposta> criar(
            @Valid @RequestBody CriacaoTipoServicoRequisicao req
    ) {
        var criado = servico.criar(req);
        return ResponseEntity.created(URI.create("/tipos-servico/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Renomeia e/ou ativa/desativa um tipo de servico. Apenas admin.")
    public ResponseEntity<TipoServicoResposta> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizacaoTipoServicoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Exclui um tipo de servico. Falha (422) se houver servico vinculado. Apenas admin.")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        servico.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
