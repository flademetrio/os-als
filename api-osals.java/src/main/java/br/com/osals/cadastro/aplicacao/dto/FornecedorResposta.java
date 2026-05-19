package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoPessoa;

public record FornecedorResposta(
        Long id,
        String nome,
        TipoPessoa tipoPessoa,
        String documento,
        String telefone,
        String email,
        boolean ativo
) {
}
