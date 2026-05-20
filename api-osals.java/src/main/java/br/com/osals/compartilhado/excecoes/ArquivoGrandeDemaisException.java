package br.com.osals.compartilhado.excecoes;

/**
 * Arquivo enviado excede o tamanho maximo permitido.
 * Mapeada para HTTP 413 (Payload Too Large).
 */
public class ArquivoGrandeDemaisException extends RuntimeException {

    public ArquivoGrandeDemaisException(String mensagem) {
        super(mensagem);
    }
}
