package br.com.osals.relatorio.aplicacao.dto;

import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Relatorio "OS por Status": contagem agregada por status (visao de gargalo)
 * e a lista paginada das OS que atendem aos filtros.
 */
public record OsPorStatusRelatorio(
        List<ContagemStatus> contagemPorStatus,
        long totalOs,
        PaginaResposta<OsItem> itens
) {

    /** Quantidade de OS num determinado status. */
    public record ContagemStatus(
            StatusOrdemServico status,
            String statusRotulo,
            long quantidade
    ) {
    }

    /** Linha do relatorio de OS. */
    public record OsItem(
            Long osId,
            String codigoExibicao,
            Long servicoId,
            Long clienteId,
            String clienteNome,
            String tecnicos,
            OffsetDateTime dataAbertura,
            LocalDate dataFimPrevista,
            StatusOrdemServico status,
            String statusRotulo
    ) {
    }
}
