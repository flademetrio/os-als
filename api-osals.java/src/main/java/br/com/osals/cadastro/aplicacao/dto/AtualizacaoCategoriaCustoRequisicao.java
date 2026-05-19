package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Admin pode renomear e ativar/desativar. NAO permite alterar codigo ou
 * tipo_lancamento — sao chaves estaveis do app (ver decisao em [08]).
 */
public record AtualizacaoCategoriaCustoRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 60) String nome,
        @NotNull(message = "ativo e obrigatorio") Boolean ativo
) {
}
