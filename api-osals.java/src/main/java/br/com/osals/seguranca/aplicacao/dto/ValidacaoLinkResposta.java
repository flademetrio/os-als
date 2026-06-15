package br.com.osals.seguranca.aplicacao.dto;

/**
 * Resultado de validar um link de redefinicao. {@code nome} (primeiro nome) so
 * vem quando o token e' valido — usado para saudar o usuario na pagina.
 */
public record ValidacaoLinkResposta(
        boolean valido,
        String nome
) {
}
