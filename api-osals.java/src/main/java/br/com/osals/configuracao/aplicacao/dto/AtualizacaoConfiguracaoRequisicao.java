package br.com.osals.configuracao.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizacaoConfiguracaoRequisicao(
        @NotBlank(message = "valor e obrigatorio")
        @Size(max = 255)
        String valor
) {
}
