package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriacaoTipoServicoRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 80) String nome
) {
}
