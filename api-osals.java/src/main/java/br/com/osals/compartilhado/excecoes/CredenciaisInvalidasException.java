package br.com.osals.compartilhado.excecoes;

/**
 * Lancada quando email/senha estao errados ou usuario nao existe. Mapeada para HTTP 401.
 */
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException(String mensagem) {
        super(mensagem);
    }
}
