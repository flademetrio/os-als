package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Categoria nova criada pelo admin. Entra sempre como tipo LIVRE; o codigo
 * e gerado pelo servico a partir do nome (slug normalizado em maiusculas).
 */
public record CriacaoCategoriaCustoRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 60) String nome
) {
}
