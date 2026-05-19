package br.com.osals.compartilhado.excecoes;

/**
 * Lancada quando um recurso solicitado por ID nao existe no banco. Mapeada para HTTP 404.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
