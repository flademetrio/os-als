package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PecaRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 120) String nome,
        @Size(max = 255) String descricao,
        Integer unidadeMedidaId
) {
}
