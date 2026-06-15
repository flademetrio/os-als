package br.com.osals.servico.aplicacao.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Representacao de uma nota fiscal do faturamento. */
public record NotaFiscalResposta(
        Long id,
        Long servicoId,
        String numero,
        LocalDate dataEmissao,
        long valorCentavos,
        OffsetDateTime createdAt,
        String createdByNome,
        OffsetDateTime updatedAt
) {
}
