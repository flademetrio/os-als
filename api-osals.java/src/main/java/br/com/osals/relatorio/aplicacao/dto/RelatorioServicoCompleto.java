package br.com.osals.relatorio.aplicacao.dto;

import br.com.osals.servico.aplicacao.dto.CobrancaResposta;
import br.com.osals.servico.aplicacao.dto.FaturamentoResposta;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoResposta;
import br.com.osals.servico.aplicacao.dto.ServicoResposta;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Dossie completo de um Servico para o relatorio: os dados do servico, as OS
 * (por data, com execucao/tecnicos/veiculo), os custos (por data) + total, a
 * cobranca e o faturamento (notas fiscais). Reaproveita os DTOs de cada modulo.
 */
public record RelatorioServicoCompleto(
        ServicoResposta servico,
        List<OrdemRelatorioItem> ordens,
        List<LancamentoCustoResposta> custos,
        long custoTotalCentavos,
        CobrancaResposta cobranca,
        FaturamentoResposta faturamento
) {

    /** OS do servico com o essencial para o dossie (execucao, quem fez, qual carro). */
    public record OrdemRelatorioItem(
            Long osId,
            String codigoExibicao,
            LocalDate dataAgendada,
            OffsetDateTime dataAbertura,
            String descricaoAtividade,
            String oQueFoiFeito,
            String observacoes,
            String impedimentos,
            String tecnicos,
            String veiculos,
            OffsetDateTime horaInicioExecucao,
            OffsetDateTime horaFimExecucao,
            String statusRotulo
    ) {
    }
}
