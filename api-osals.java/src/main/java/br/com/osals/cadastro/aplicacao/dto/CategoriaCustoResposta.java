package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoLancamentoCusto;

public record CategoriaCustoResposta(
        Integer id,
        String codigo,
        String nome,
        TipoLancamentoCusto tipoLancamento,
        boolean ativo
) {
}
