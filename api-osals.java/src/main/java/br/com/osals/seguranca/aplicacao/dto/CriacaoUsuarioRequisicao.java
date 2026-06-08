package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriacaoUsuarioRequisicao(
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

        @NotNull(message = "papel e obrigatorio")
        Papel papel
) {
}
