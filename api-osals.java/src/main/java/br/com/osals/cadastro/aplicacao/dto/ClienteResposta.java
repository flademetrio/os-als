package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoPessoa;
import java.time.OffsetDateTime;

public record ClienteResposta(
        Long id,
        TipoPessoa tipoPessoa,
        String documento,
        String nome,
        String nomeFantasia,
        boolean ativo,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
