package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.EmpresaServico;
import br.com.osals.servico.dominio.StatusServico;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Representacao completa de um Servico para a tela de detalhe.
 */
public record ServicoResposta(
        Long id,
        Integer numero,
        String numeroFormatado,
        Long clienteId,
        String clienteNome,
        Integer tipoServicoId,
        String tipoServicoNome,
        String descricao,
        EmpresaServico empresa,
        String empresaRotulo,
        LocalDate dataInicioPrevista,
        LocalDate dataFimPrevista,
        StatusServico status,
        String statusRotulo,
        OffsetDateTime finalizadoEm,
        String finalizadoPorNome,
        OffsetDateTime createdAt,
        String createdByNome,
        OffsetDateTime updatedAt
) {
}
