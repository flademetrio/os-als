package br.com.osals.compartilhado.excecoes;

/**
 * Excecao base para regras de negocio violadas. Mapeada para HTTP 422 (Unprocessable Entity).
 *
 * A mensagem deve ser em pt-BR amigavel ao usuario final — pode ser exibida diretamente na UI.
 */
public class NegocioException extends RuntimeException {

    public NegocioException(String mensagem) {
        super(mensagem);
    }
}
