package br.com.osals.seguranca.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corpo do POST publico que redefine a senha a partir do token do link. */
public record RedefinicaoSenhaPorTokenRequisicao(
        @NotBlank(message = "token e obrigatorio")
        String token,

        @NotBlank(message = "novaSenha e obrigatoria")
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres")
        String novaSenha
) {
}
