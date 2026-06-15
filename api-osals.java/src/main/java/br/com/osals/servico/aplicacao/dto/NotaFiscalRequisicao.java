package br.com.osals.servico.aplicacao.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Dados de uma nota fiscal do faturamento. */
public record NotaFiscalRequisicao(

        @NotBlank(message = "informe o numero da nota fiscal")
        @Size(max = 40, message = "numero deve ter no maximo 40 caracteres")
        String numero,

        @NotNull(message = "informe a data de emissao")
        LocalDate dataEmissao,

        @NotNull(message = "informe o valor")
        @Min(value = 0, message = "valorCentavos nao pode ser negativo")
        Long valorCentavos
) {
}
