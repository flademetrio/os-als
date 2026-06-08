package br.com.osals.anexo.api;

import br.com.osals.anexo.aplicacao.GestorAnexo;
import br.com.osals.anexo.aplicacao.dto.AnexoOsResposta;
import br.com.osals.anexo.aplicacao.dto.ConteudoAnexo;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Anexo PDF unico de uma OS: o scan do papel preenchido. Reanexar substitui
 * o arquivo anterior (o antigo e apagado do storage).
 *
 * Substituir/remover o anexo de uma OS encerrada exige gerente ou admin.
 */
@RestController
@RequestMapping("/ordens-servico/{osId}/anexo")
@Tag(name = "Anexo da OS", description = "Scan do papel da OS preenchida pela equipe")
public class ControladorAnexoOs {

    private final GestorAnexo gestor;

    public ControladorAnexoOs(GestorAnexo gestor) {
        this.gestor = gestor;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SERVICO_VER')")
    @Operation(summary = "Metadados do anexo da OS.")
    public ResponseEntity<AnexoOsResposta> metadados(@PathVariable Long osId) {
        return ResponseEntity.ok(gestor.metadadosAnexoOs(osId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SERVICO_GERENCIAR')")
    @Operation(summary = "Anexa (ou substitui) o PDF da OS.")
    public ResponseEntity<AnexoOsResposta> anexar(
            @PathVariable Long osId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @AuthenticationPrincipal Usuario autor
    ) {
        return ResponseEntity.ok(gestor.anexarNaOs(osId, arquivo, autor));
    }

    @GetMapping("/conteudo")
    @PreAuthorize("hasAuthority('SERVICO_VER')")
    @Operation(summary = "Baixa o conteudo do anexo da OS (PDF, inline).")
    public ResponseEntity<Resource> baixar(@PathVariable Long osId) {
        ConteudoAnexo c = gestor.baixarAnexoOs(osId);
        return ControladorAnexoServico.respostaPdf(c);
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('SERVICO_GERENCIAR')")
    @Operation(summary = "Remove o anexo da OS.")
    public ResponseEntity<Void> remover(
            @PathVariable Long osId,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.removerAnexoOs(osId, autor);
        return ResponseEntity.noContent().build();
    }
}
