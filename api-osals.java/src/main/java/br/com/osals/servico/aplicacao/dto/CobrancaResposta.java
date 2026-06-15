package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.StatusFaturamento;
import br.com.osals.servico.dominio.TipoCobranca;
import java.time.OffsetDateTime;

/** Representacao da cobranca de um Servico. */
public record CobrancaResposta(
        Long servicoId,
        TipoCobranca tipo,
        String tipoRotulo,
        Long valorCentavos,
        Integer diasPrevistos,
        Integer qtdePessoas,
        String obs,
        StatusFaturamento faturamentoStatus,
        String faturamentoStatusRotulo,
        OffsetDateTime fechadoEm,
        String fechadoPorNome,
        OffsetDateTime updatedAt
) {
}
