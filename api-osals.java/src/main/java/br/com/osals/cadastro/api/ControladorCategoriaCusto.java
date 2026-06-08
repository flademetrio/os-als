package br.com.osals.cadastro.api;

import br.com.osals.cadastro.aplicacao.ServicoCategoriaCusto;
import br.com.osals.cadastro.aplicacao.dto.AtualizacaoCategoriaCustoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CategoriaCustoResposta;
import br.com.osals.cadastro.aplicacao.dto.CriacaoCategoriaCustoRequisicao;
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
 * Cataloga as categorias de custo. Admin pode criar (sempre tipo LIVRE),
 * renomear, ativar/desativar e excluir. As 2 estruturadas (mao de obra e
 * deslocamento) ficam protegidas contra exclusao.
 */
@RestController
@RequestMapping("/categorias-custo")
@Tag(name = "Categorias de Custo")
public class ControladorCategoriaCusto {

    private final ServicoCategoriaCusto servico;

    public ControladorCategoriaCusto(ServicoCategoriaCusto servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CUSTO_VER')")
    public ResponseEntity<List<CategoriaCustoResposta>> listar(
            @RequestParam(defaultValue = "true") boolean apenasAtivos
    ) {
        return ResponseEntity.ok(servico.listar(apenasAtivos));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Cria categoria nova. Apenas admin. Sempre entra como tipo LIVRE.")
    public ResponseEntity<CategoriaCustoResposta> criar(
            @Valid @RequestBody CriacaoCategoriaCustoRequisicao req
    ) {
        CategoriaCustoResposta criada = servico.criar(req);
        return ResponseEntity.created(URI.create("/categorias-custo/" + criada.id())).body(criada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Renomeia e/ou ativa/desativa categoria. Codigo e tipo sao imutaveis.")
    public ResponseEntity<CategoriaCustoResposta> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizacaoCategoriaCustoRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONFIG_GERENCIAR')")
    @Operation(summary = "Exclui categoria. Bloqueado para estruturadas (mao de obra/deslocamento) "
            + "e para categorias com lancamentos historicos.")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        servico.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
