package br.com.osals.ordemservico.aplicacao.dto;

import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Versao compacta de OS para listagens paginadas. */
public record OrdemServicoResumoDto(
        Long id,
        Integer numero,
        String codigoExibicao,
        Long servicoId,
        String servicoDescricao,
        Long clienteId,
        String clienteNome,
        String descricaoAtividade,
        StatusOrdemServico status,
        String statusRotulo,
        LocalDate dataAgendada,
        OffsetDateTime dataAbertura
) {
}
