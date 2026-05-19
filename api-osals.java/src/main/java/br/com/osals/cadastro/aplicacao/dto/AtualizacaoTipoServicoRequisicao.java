package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizacaoTipoServicoRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 80) String nome,
        @NotNull(message = "ativo e obrigatorio") Boolean ativo
) {
}
