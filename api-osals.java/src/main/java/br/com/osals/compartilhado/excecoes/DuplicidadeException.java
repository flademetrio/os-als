package br.com.osals.compartilhado.excecoes;

/**
 * Lancada quando uma constraint UNIQUE seria violada (ex.: email ja cadastrado). Mapeada para HTTP 409.
 */
public class DuplicidadeException extends RuntimeException {

    public DuplicidadeException(String mensagem) {
        super(mensagem);
    }
}
