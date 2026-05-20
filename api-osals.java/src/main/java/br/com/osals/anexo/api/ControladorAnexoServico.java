package br.com.osals.anexo.api;

import br.com.osals.anexo.aplicacao.GestorAnexo;
import br.com.osals.anexo.aplicacao.dto.AnexoServicoResposta;
import br.com.osals.anexo.aplicacao.dto.ConteudoAnexo;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Anexos PDF de um Servico — multiplos por servico.
 *
 * Upload/listagem/download disponivel a qualquer autenticado. Remover anexo
 * de Servico encerrado exige gerente ou admin (regra no GestorAnexo).
 */
@RestController
@Tag(name = "Anexos do Servico", description = "Upload e download de PDFs vinculados ao Servico")
public class ControladorAnexoServico {

    private final GestorAnexo gestor;

    public ControladorAnexoServico(GestorAnexo gestor) {
        this.gestor = gestor;
    }

    @GetMapping("/servicos/{servicoId}/anexos")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista os anexos do Servico.")
    public ResponseEntity<List<AnexoServicoResposta>> listar(@PathVariable Long servicoId) {
        return ResponseEntity.ok(gestor.listarDoServico(servicoId));
    }

    @PostMapping(value = "/servicos/{servicoId}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Anexa um PDF ao Servico (multipart/form-data).")
    public ResponseEntity<AnexoServicoResposta> anexar(
            @PathVariable Long servicoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @AuthenticationPrincipal Usuario autor
    ) {
        var anexo = gestor.anexarAoServico(servicoId, arquivo, descricao, autor);
        return ResponseEntity
                .created(URI.create("/anexos-servico/" + anexo.id() + "/conteudo"))
                .body(anexo);
    }

    @GetMapping("/anexos-servico/{anexoId}/conteudo")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Baixa o conteudo do anexo (PDF, inline).")
    public ResponseEntity<Resource> baixar(@PathVariable Long anexoId) {
        ConteudoAnexo c = gestor.baixarAnexoServico(anexoId);
        return respostaPdf(c);
    }

    @DeleteMapping("/servicos/{servicoId}/anexos/{anexoId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove um anexo do Servico.")
    public ResponseEntity<Void> remover(
            @PathVariable Long servicoId,
            @PathVariable Long anexoId,
            @AuthenticationPrincipal Usuario autor
    ) {
        gestor.removerAnexoServico(servicoId, anexoId, autor);
        return ResponseEntity.noContent().build();
    }

    static ResponseEntity<Resource> respostaPdf(ConteudoAnexo c) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentLength(c.tamanhoBytes());
        headers.setContentDisposition(ContentDisposition.inline()
                .filename(c.nomeArquivo()).build());
        return ResponseEntity.ok().headers(headers).body(c.recurso());
    }
}
