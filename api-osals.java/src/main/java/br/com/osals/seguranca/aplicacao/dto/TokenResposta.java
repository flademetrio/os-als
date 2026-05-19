package br.com.osals.seguranca.aplicacao.dto;

/**
 * Resposta de login/refresh. Os tokens reais vao em cookies httpOnly;
 * este DTO confirma os dados do usuario logado.
 */
public record TokenResposta(
        UsuarioResumoDto usuario,
        long expiraEm
) {
}
