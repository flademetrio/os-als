package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoPessoa;

/** Versao compacta usada em listagens e referencias (ex.: select de cliente em Servico). */
public record ClienteResumoDto(
        Long id,
        TipoPessoa tipoPessoa,
        String documento,
        String nome,
        boolean ativo
) {
}
