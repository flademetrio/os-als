package br.com.osals.servico.api;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.GestorServico;
import br.com.osals.servico.aplicacao.dto.AtualizacaoServicoRequisicao;
import br.com.osals.servico.aplicacao.dto.CriacaoServicoRequisicao;
import br.com.osals.servico.aplicacao.dto.MudancaStatusRequisicao;
import br.com.osals.servico.aplicacao.dto.ServicoResposta;
import br.com.osals.servico.aplicacao.dto.ServicoResumoDto;
import br.com.osals.servico.dominio.StatusServico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
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

/**
 * Endpoints do nucleo Servico. Listar/criar/editar/encerrar disponivel a
 * operador, gerente e admin (ver documentacao/10-matriz-permissoes.md).
 * Servico encerrado nao pode ser editado nem transicionado (regra na entidade).
 */
@RestController
@RequestMapping("/servicos")
@Tag(name = "Servicos", description = "Nucleo operacional: cadastro e ciclo de vida do Servico")
public class ControladorServico {

    private final GestorServico gestor;

    public ControladorServico(GestorServico gestor) {
        this.gestor = gestor;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista Servicos com filtros (status, cliente, tipo, periodo) e paginacao. "
            + "O parametro status aceita multiplos valores.")
    public ResponseEntity<PaginaResposta<ServicoResumoDto>> listar(
            @RequestParam(required = false) List<StatusServico> status,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Integer tipoServicoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String busca,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                gestor.listar(status, clienteId, tipoServicoId, inicio, fim, busca, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServicoResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(gestor.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Abre um novo Servico. Numero sequencial atribuido pelo sistema.")
    public ResponseEntity<ServicoResposta> criar(
            @Valid @RequestBody CriacaoServicoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        var s = gestor.criar(req, autor);
        return ResponseEntity.created(URI.create("/servicos/" + s.id())).body(s);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Edita um Servico. Falha com 422 se ja estiver concluido ou cancelado.")
    public ResponseEntity<ServicoResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizacaoServicoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.atualizar(id, req, autor));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Move o Servico entre estados intermediarios (EM_ABERTO, EM_EXECUCAO, AGUARDANDO).")
    public ResponseEntity<ServicoResposta> mudarStatus(
            @PathVariable Long id,
            @Valid @RequestBody MudancaStatusRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.mudarStatus(id, req.status(), autor));
    }

    @PostMapping("/{id}/finalizar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Conclui o Servico. Nao pode ser reaberto depois.")
    public ResponseEntity<ServicoResposta> finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.finalizar(id, autor));
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancela o Servico. Encerramento alternativo.")
    public ResponseEntity<ServicoResposta> cancelar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.cancelar(id, autor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exclui permanentemente o Servico (e tudo o que depende dele: "
            + "OS, anexos, lancamentos de custo). Apenas admin.")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.excluir(id, autor);
        return ResponseEntity.noContent().build();
    }
}
