package br.com.osals.seguranca.api;

import br.com.osals.seguranca.aplicacao.ServicoUsuario;
import br.com.osals.seguranca.aplicacao.dto.AtualizacaoPermissoesRequisicao;
import br.com.osals.seguranca.aplicacao.dto.AtualizacaoUsuarioRequisicao;
import br.com.osals.seguranca.aplicacao.dto.CriacaoUsuarioRequisicao;
import br.com.osals.seguranca.aplicacao.dto.RedefinicaoSenhaUsuarioRequisicao;
import br.com.osals.seguranca.aplicacao.dto.UsuarioAdminResposta;
import br.com.osals.seguranca.aplicacao.dto.UsuarioAdminResumoDto;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

/**
 * Administracao de usuarios e permissoes. Todo o controlador exige a permissao
 * USUARIO_GERENCIAR (na pratica, apenas ADMIN no preset padrao).
 *
 * Tecnicos sao criados/editados na tela de tecnicos (/tecnicos); aqui sao
 * apenas visiveis e podem ter permissoes/senha/ativacao ajustadas.
 */
@RestController
@RequestMapping("/usuarios")
@PreAuthorize("hasAuthority('USUARIO_GERENCIAR')")
@Tag(name = "Usuarios", description = "Administracao de usuarios e permissoes (somente USUARIO_GERENCIAR)")
public class ControladorUsuario {

    private final ServicoUsuario servico;

    public ControladorUsuario(ServicoUsuario servico) {
        this.servico = servico;
    }

    @GetMapping
    @Operation(summary = "Lista todos os usuarios.")
    public ResponseEntity<List<UsuarioAdminResumoDto>> listar() {
        return ResponseEntity.ok(servico.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe de um usuario com as permissoes concedidas.")
    public ResponseEntity<UsuarioAdminResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Cria um usuario com as permissoes do preset do papel escolhido.")
    public ResponseEntity<UsuarioAdminResposta> criar(@Valid @RequestBody CriacaoUsuarioRequisicao req) {
        var u = servico.criar(req);
        return ResponseEntity.created(URI.create("/usuarios/" + u.id())).body(u);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza nome e papel do usuario.")
    public ResponseEntity<UsuarioAdminResposta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizacaoUsuarioRequisicao req
    ) {
        return ResponseEntity.ok(servico.atualizar(id, req));
    }

    @PutMapping("/{id}/permissoes")
    @Operation(summary = "Substitui o conjunto de permissoes concedidas ao usuario.")
    public ResponseEntity<UsuarioAdminResposta> definirPermissoes(
            @PathVariable Long id,
            @Valid @RequestBody AtualizacaoPermissoesRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(servico.definirPermissoes(id, req, autor));
    }

    @PutMapping("/{id}/senha")
    @Operation(summary = "Redefine a senha do usuario. Invalida sessoes vigentes.")
    public ResponseEntity<Void> redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody RedefinicaoSenhaUsuarioRequisicao req
    ) {
        servico.redefinirSenha(id, req);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ativar")
    @Operation(summary = "Reativa um usuario inativo.")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        servico.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativa um usuario (soft delete). Nao e' possivel inativar a si mesmo.")
    public ResponseEntity<Void> inativar(@PathVariable Long id, @AuthenticationPrincipal Usuario autor) {
        servico.inativar(id, autor);
        return ResponseEntity.noContent().build();
    }
}
