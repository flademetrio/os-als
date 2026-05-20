package br.com.osals.compartilhado.api;

import br.com.osals.compartilhado.excecoes.ArquivoGrandeDemaisException;
import br.com.osals.compartilhado.excecoes.ArquivoInvalidoException;
import br.com.osals.compartilhado.excecoes.CredenciaisInvalidasException;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.compartilhado.excecoes.UsuarioBloqueadoException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Handler global de excecoes da API. Converte tudo em {@link ErroResposta}.
 *
 * Mantem stacktraces fora do response. Logs internos preservam o detalhe.
 */
@RestControllerAdvice
public class TratadorExcecoesGlobal {

    private static final Logger log = LoggerFactory.getLogger(TratadorExcecoesGlobal.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> tratar(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(new ErroResposta(400, mensagem));
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErroResposta> tratar(NegocioException ex) {
        return ResponseEntity.unprocessableEntity().body(new ErroResposta(422, ex.getMessage()));
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> tratar(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(404).body(new ErroResposta(404, ex.getMessage()));
    }

    @ExceptionHandler(DuplicidadeException.class)
    public ResponseEntity<ErroResposta> tratar(DuplicidadeException ex) {
        return ResponseEntity.status(409).body(new ErroResposta(409, ex.getMessage()));
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroResposta> tratar(CredenciaisInvalidasException ex) {
        return ResponseEntity.status(401).body(new ErroResposta(401, ex.getMessage()));
    }

    @ExceptionHandler(UsuarioBloqueadoException.class)
    public ResponseEntity<ErroResposta> tratar(UsuarioBloqueadoException ex) {
        return ResponseEntity.status(423).body(new ErroResposta(423, ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResposta> tratar(AccessDeniedException ex) {
        return ResponseEntity.status(403).body(new ErroResposta(403, "Sem permissao para esta operacao."));
    }

    @ExceptionHandler(ArquivoInvalidoException.class)
    public ResponseEntity<ErroResposta> tratar(ArquivoInvalidoException ex) {
        return ResponseEntity.badRequest().body(new ErroResposta(400, ex.getMessage()));
    }

    @ExceptionHandler(ArquivoGrandeDemaisException.class)
    public ResponseEntity<ErroResposta> tratar(ArquivoGrandeDemaisException ex) {
        return ResponseEntity.status(413).body(new ErroResposta(413, ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErroResposta> tratar(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(413).body(new ErroResposta(413,
                "Arquivo excede o tamanho maximo permitido."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResposta> tratar(NoResourceFoundException ex) {
        return ResponseEntity.status(404).body(new ErroResposta(404, "Recurso nao encontrado."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResposta> tratar(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(405).body(new ErroResposta(405,
                "Metodo " + ex.getMethod() + " nao permitido neste endpoint."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> tratar(Exception ex) {
        log.error("Erro nao tratado", ex);
        return ResponseEntity.status(500).body(new ErroResposta(500, "Erro interno. Tente novamente."));
    }
}
