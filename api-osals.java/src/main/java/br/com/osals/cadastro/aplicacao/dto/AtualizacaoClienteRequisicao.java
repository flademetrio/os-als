package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizacaoClienteRequisicao(
        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 160)
        String nome,

        @Size(max = 160)
        String nomeFantasia
) {
}
