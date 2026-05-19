package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoPessoa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CriacaoClienteRequisicao(
        @NotNull(message = "tipoPessoa e obrigatorio")
        TipoPessoa tipoPessoa,

        @NotBlank(message = "documento e obrigatorio")
        @Pattern(regexp = "\\d{11}|\\d{14}", message = "Documento deve conter 11 (CPF) ou 14 (CNPJ) digitos")
        String documento,

        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 160)
        String nome,

        @Size(max = 160)
        String nomeFantasia
) {
}
