package br.com.osals.compartilhado.excecoes;

/**
 * Arquivo enviado nao atende ao formato esperado (ex.: nao e um PDF valido).
 * Mapeada para HTTP 400 (Bad Request).
 */
public class ArquivoInvalidoException extends RuntimeException {

    public ArquivoInvalidoException(String mensagem) {
        super(mensagem);
    }
}
