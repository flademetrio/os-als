package br.com.osals.configuracao.api;

import br.com.osals.configuracao.aplicacao.ServicoConfiguracao;
import br.com.osals.configuracao.aplicacao.dto.AtualizacaoConfiguracaoRequisicao;
import br.com.osals.configuracao.aplicacao.dto.ConfiguracaoResposta;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/configuracoes")
@Tag(name = "Configuracoes", description = "Configuracoes globais do sistema (markup, valor/km, ...)")
public class ControladorConfiguracao {

    private final ServicoConfiguracao servico;

    public ControladorConfiguracao(ServicoConfiguracao servico) {
        this.servico = servico;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista todas as configuracoes. Apenas admin.")
    public ResponseEntity<List<ConfiguracaoResposta>> listar() {
        return ResponseEntity.ok(servico.listar());
    }

    @GetMapping("/{chave}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoResposta> buscar(@PathVariable String chave) {
        return ResponseEntity.ok(servico.buscar(chave));
    }

    @PutMapping("/{chave}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza valor da configuracao. Tipo e validado conforme cadastro.")
    public ResponseEntity<ConfiguracaoResposta> atualizar(
            @PathVariable String chave,
            @Valid @RequestBody AtualizacaoConfiguracaoRequisicao req,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(servico.atualizar(chave, req, autor));
    }
}
