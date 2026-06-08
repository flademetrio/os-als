package br.com.osals.seguranca.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinicaoSenhaUsuarioRequisicao(
        @NotBlank(message = "novaSenha e obrigatoria")
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres")
        String novaSenha
) {
}
