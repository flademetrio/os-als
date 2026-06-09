package br.com.osals.servico.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoLancamentoCusto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Representacao de um lancamento de custo. */
public record LancamentoCustoResposta(
        Long id,
        Long servicoId,
        Integer categoriaCustoId,
        String categoriaCodigo,
        String categoriaNome,
        TipoLancamentoCusto tipoLancamento,
        String descricao,
        long valorTotalCentavos,
        LocalDate dataCusto,
        Long tecnicoId,
        String tecnicoNome,
        BigDecimal horas,
        Long valorHoraSnapshotCentavos,
        BigDecimal km,
        Long valorKmSnapshotCentavos,
        OffsetDateTime createdAt,
        String createdByNome,
        OffsetDateTime updatedAt
) {
}
