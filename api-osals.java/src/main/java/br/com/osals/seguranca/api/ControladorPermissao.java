package br.com.osals.seguranca.api;

import br.com.osals.seguranca.aplicacao.ServicoUsuario;
import br.com.osals.seguranca.aplicacao.dto.CatalogoPermissoesResposta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Catalogo de permissoes do sistema + presets por papel, para a tela de
 * administracao de usuarios. Exige USUARIO_GERENCIAR.
 */
@RestController
@RequestMapping("/permissoes")
@PreAuthorize("hasAuthority('USUARIO_GERENCIAR')")
@Tag(name = "Permissoes", description = "Catalogo de permissoes e presets por papel")
public class ControladorPermissao {

    private final ServicoUsuario servico;

    public ControladorPermissao(ServicoUsuario servico) {
        this.servico = servico;
    }

    @GetMapping
    @Operation(summary = "Lista o catalogo de permissoes agrupado e os presets por papel.")
    public ResponseEntity<CatalogoPermissoesResposta> catalogo() {
        return ResponseEntity.ok(servico.catalogo());
    }
}
