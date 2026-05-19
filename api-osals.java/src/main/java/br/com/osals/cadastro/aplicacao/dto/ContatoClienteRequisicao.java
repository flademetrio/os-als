package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContatoClienteRequisicao(
        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 120)
        String nome,

        @Size(max = 60)
        String funcao,

        @Size(max = 20)
        String telefone,

        @Email(message = "email invalido")
        @Size(max = 160)
        String email
) {
}
