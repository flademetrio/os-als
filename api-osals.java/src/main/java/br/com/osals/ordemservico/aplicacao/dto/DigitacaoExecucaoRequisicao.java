package br.com.osals.ordemservico.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

/**
 * Dados de execucao digitados pelo operador a partir da OS preenchida a mao.
 * Concluir a OS. Horas e campos de texto auxiliares sao opcionais.
 */
public record DigitacaoExecucaoRequisicao(

        OffsetDateTime horaInicioExecucao,
        OffsetDateTime horaFimExecucao,

        @NotBlank(message = "informe o que foi feito")
        String oQueFoiFeito,

        String observacoes,
        String impedimentos
) {
}
