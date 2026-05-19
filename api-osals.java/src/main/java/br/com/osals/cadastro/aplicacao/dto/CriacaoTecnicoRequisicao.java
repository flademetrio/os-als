package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriacaoTecnicoRequisicao(
        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 120)
        String nome,

        @NotBlank(message = "email e obrigatorio")
        @Email(message = "email invalido")
        @Size(max = 160)
        String email,

        @NotBlank(message = "senha e obrigatoria")
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres")
        String senha,

        @NotNull(message = "valorHoraCentavos e obrigatorio")
        @Min(value = 0, message = "valorHoraCentavos nao pode ser negativo")
        Long valorHoraCentavos,

        @Size(max = 80)
        String especialidade,

        @Size(max = 20)
        String telefone
) {
}
