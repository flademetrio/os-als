package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnidadeMedidaRequisicao(
        @NotBlank @Size(max = 8) String sigla,
        @NotBlank @Size(max = 40) String nome
) {
}
