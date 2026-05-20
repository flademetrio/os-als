package br.com.osals.anexo.aplicacao.dto;

import java.time.OffsetDateTime;

/** Metadados do anexo unico de uma OS. */
public record AnexoOsResposta(
        Long osId,
        String nomeArquivo,
        String contentType,
        long tamanhoBytes,
        OffsetDateTime createdAt,
        String createdByNome
) {
}
