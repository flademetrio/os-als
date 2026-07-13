package br.com.osals.servico.aplicacao.dto;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Referencia para o lancamento de mao de obra: os tecnicos que trabalharam nas
 * OS deste servico numa data (pela data agendada) e, para cada um, todas as OS
 * dele naquele dia (deste e de outros servicos) com o horario trabalhado quando
 * a OS ja foi digitada. Serve de parametro para quem lanca preencher as horas.
 */
public record MaoDeObraReferencia(List<TecnicoReferencia> tecnicos) {

    public record TecnicoReferencia(
            Long tecnicoId,
            String nome,
            long valorHoraCentavos,
            List<OrdemDoDia> ordens
    ) {
    }

    public record OrdemDoDia(
            Long osId,
            String codigoExibicao,
            Long servicoId,
            boolean desteServico,
            String clienteNome,
            String descricaoAtividade,
            OffsetDateTime horaInicioExecucao,
            OffsetDateTime horaFimExecucao
    ) {
    }
}
