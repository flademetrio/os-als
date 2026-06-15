package br.com.osals.seguranca.api;

import br.com.osals.seguranca.aplicacao.ServicoRedefinicaoSenha;
import br.com.osals.seguranca.aplicacao.dto.RedefinicaoSenhaPorTokenRequisicao;
import br.com.osals.seguranca.aplicacao.dto.ValidacaoLinkResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints PUBLICOS de redefinicao de senha por link (sem autenticacao —
 * liberados no SegurancaConfig). O admin gera o link em /usuarios/{id}/link-redefinicao-senha;
 * aqui o usuario valida o token e define a nova senha.
 */
@RestController
@RequestMapping("/auth/redefinir-senha")
@Tag(name = "Redefinicao de senha", description = "Validar link e definir nova senha (publico)")
public class ControladorRedefinicaoSenha {

    private final ServicoRedefinicaoSenha servico;

    public ControladorRedefinicaoSenha(ServicoRedefinicaoSenha servico) {
        this.servico = servico;
    }

    @GetMapping("/validar")
    @Operation(summary = "Valida o token do link e retorna o primeiro nome do usuario, se valido.")
    public ResponseEntity<ValidacaoLinkResposta> validar(@RequestParam String token) {
        return ResponseEntity.ok(servico.validar(token));
    }

    @PostMapping
    @Operation(summary = "Define a nova senha a partir do token do link.")
    public ResponseEntity<Void> redefinir(@Valid @RequestBody RedefinicaoSenhaPorTokenRequisicao req) {
        servico.redefinir(req.token(), req.novaSenha());
        return ResponseEntity.noContent().build();
    }
}
