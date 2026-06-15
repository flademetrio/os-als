package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.StatusFaturamento;
import br.com.osals.servico.dominio.TipoCobranca;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Visao do faturamento de um Servico: estado, total das NFs comparado ao valor
 * da cobranca e a lista de notas. {@code aplicavel} e false quando a cobranca
 * nao e do tipo COBRADO.
 */
public record FaturamentoResposta(
        Long servicoId,
        TipoCobranca tipoCobranca,
        boolean aplicavel,
        StatusFaturamento status,
        String statusRotulo,
        Long valorCobrancaCentavos,
        long totalNfCentavos,
        Long diferencaCentavos,
        boolean podeFechar,
        OffsetDateTime fechadoEm,
        String fechadoPorNome,
        List<NotaFiscalResposta> notas
) {
}
