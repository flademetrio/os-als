package br.com.osals.ordemservico.aplicacao.dto;

import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import java.time.OffsetDateTime;

/** Versao compacta de OS para listagens paginadas. */
public record OrdemServicoResumoDto(
        Long id,
        Integer numero,
        String codigoExibicao,
        Long servicoId,
        Long clienteId,
        String clienteNome,
        String descricaoAtividade,
        StatusOrdemServico status,
        String statusRotulo,
        OffsetDateTime dataAbertura
) {
}
