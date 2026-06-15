package br.com.osals.seguranca.aplicacao.dto;

import java.time.OffsetDateTime;

/**
 * Resposta da geracao do link de redefinicao de senha. O token cru e' devolvido
 * apenas aqui (nao fica gravado); o front monta a URL e o admin envia manualmente.
 */
public record LinkRedefinicaoResposta(
        String token,
        OffsetDateTime expiraEm
) {
}
