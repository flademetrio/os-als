package br.com.osals.seguranca.aplicacao.dto;

import java.time.Instant;

/**
 * Resultado interno do servico de autenticacao. Carrega tokens em claro
 * (acess + refresh opaco) + metadados para o controlador setar nos cookies.
 *
 * NAO retornado direto pra API — vai pro controlador que monta TokenResposta
 * publica e seta os cookies.
 */
public record ResultadoLogin(
        UsuarioResumoDto usuario,
        String accessToken,
        String refreshToken,
        Instant accessExpiraEm,
        Instant refreshExpiraEm
) {
}
