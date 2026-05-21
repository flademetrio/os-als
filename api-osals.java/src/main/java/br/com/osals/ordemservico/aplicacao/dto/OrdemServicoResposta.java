package br.com.osals.ordemservico.aplicacao.dto;

import br.com.osals.ordemservico.dominio.StatusOrdemServico;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Representacao completa de uma OS para a tela de detalhe.
 * O codigo de exibicao tem o formato SSSS-NNNNN (servico pai + numero da OS).
 */
public record OrdemServicoResposta(
        Long id,
        Integer numero,
        String codigoExibicao,
        Long servicoId,
        Integer servicoNumero,
        String servicoNumeroFormatado,
        Long clienteId,
        String clienteNome,
        String tipoServicoNome,
        String descricaoAtividade,
        StatusOrdemServico status,
        String statusRotulo,
        LocalDate dataAgendada,
        OffsetDateTime dataAbertura,
        OffsetDateTime dataImpressao,
        OffsetDateTime horaInicioExecucao,
        OffsetDateTime horaFimExecucao,
        String oQueFoiFeito,
        String observacoes,
        String impedimentos,
        OffsetDateTime digitadoEm,
        String digitadoPorNome,
        OffsetDateTime createdAt,
        String createdByNome,
        List<OsTecnicoDto> tecnicos,
        List<OsVeiculoDto> veiculos,
        List<OsEquipamentoDto> equipamentos,
        List<OsContatoDto> contatos
) {
}
