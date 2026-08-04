package br.com.osals.relatorio.aplicacao.dto;

import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Item do relatorio de OS por periodo (pela data agendada). O dia da semana e a
 * formatacao do horario de execucao sao montados no frontend a partir destes campos.
 */
public record OsPorPeriodoItem(
        Long osId,
        LocalDate data,
        String codigoExibicao,
        String clienteNome,
        String servicoDescricao,
        String atividade,
        String tecnicos,
        String veiculos,
        OffsetDateTime horaInicioExecucao,
        OffsetDateTime horaFimExecucao,
        StatusOrdemServico status,
        String statusRotulo
) {
}
