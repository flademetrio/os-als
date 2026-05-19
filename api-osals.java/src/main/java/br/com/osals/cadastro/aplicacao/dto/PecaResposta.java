package br.com.osals.cadastro.aplicacao.dto;

public record PecaResposta(
        Long id,
        String nome,
        String descricao,
        Integer unidadeMedidaId,
        String unidadeMedidaSigla,
        boolean ativo
) {
}
