package br.com.osals.configuracao.aplicacao.dto;

import br.com.osals.configuracao.dominio.TipoValorConfiguracao;
import java.time.OffsetDateTime;

public record ConfiguracaoResposta(
        String chave,
        String valor,
        TipoValorConfiguracao tipo,
        String descricao,
        OffsetDateTime updatedAt,
        String updatedByNome
) {
}
