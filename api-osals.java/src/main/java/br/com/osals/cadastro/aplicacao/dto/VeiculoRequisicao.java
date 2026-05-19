package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusVeiculo;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VeiculoRequisicao(
        @NotBlank(message = "placa e obrigatoria")
        @Pattern(regexp = "[A-Z]{3}[0-9][A-Z0-9][0-9]{2}",
                 message = "Placa invalida (formato Mercosul: AAA0A00 ou AAA0000)")
        String placa,

        @Size(max = 40)
        String marca,

        @Size(max = 60)
        String modelo,

        @Min(value = 1980, message = "Ano deve ser >= 1980")
        @Max(value = 2100, message = "Ano deve ser <= 2100")
        Integer ano,

        StatusVeiculo status
) {
}
