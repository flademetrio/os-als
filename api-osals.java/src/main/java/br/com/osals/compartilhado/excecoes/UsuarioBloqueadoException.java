package br.com.osals.compartilhado.excecoes;

/**
 * Lancada quando o usuario excedeu o limite de tentativas de login. Mapeada para HTTP 423.
 */
public class UsuarioBloqueadoException extends RuntimeException {

    public UsuarioBloqueadoException(String mensagem) {
        super(mensagem);
    }
}
