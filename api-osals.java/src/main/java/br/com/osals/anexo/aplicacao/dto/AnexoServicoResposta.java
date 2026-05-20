package br.com.osals.anexo.aplicacao.dto;

import java.time.OffsetDateTime;

/** Metadados de um anexo de Servico. */
public record AnexoServicoResposta(
        Long id,
        Long servicoId,
        String nomeArquivo,
        String descricao,
        String contentType,
        long tamanhoBytes,
        OffsetDateTime createdAt,
        String createdByNome
) {
}
