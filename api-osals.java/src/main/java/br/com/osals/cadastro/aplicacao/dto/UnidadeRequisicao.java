package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UnidadeRequisicao(
        @NotBlank(message = "identificacaoInterna e obrigatoria")
        @Size(max = 80)
        String identificacaoInterna,

        @Pattern(regexp = "|\\d{8}", message = "CEP deve conter 8 digitos")
        String cep,

        @Size(max = 160)
        String logradouro,

        @Size(max = 20)
        String numero,

        @Size(max = 80)
        String complemento,

        @Size(max = 80)
        String bairro,

        @Size(max = 80)
        String cidade,

        @Pattern(regexp = "|[A-Z]{2}", message = "Estado deve ser UF de 2 letras maiusculas")
        String estado
) {
}
