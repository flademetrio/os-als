package br.com.osals.ordemservico.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Set;

/**
 * Dados para abrir uma OS dentro de um Servico.
 * Tecnicos sao obrigatorios (1..N); equipamentos e veiculos sao opcionais.
 * dataAgendada e o dia previsto da visita da equipe ao cliente.
 */
public record AberturaOsRequisicao(

        @NotBlank(message = "descricaoAtividade e obrigatoria")
        String descricaoAtividade,

        @NotNull(message = "informe a data agendada")
        LocalDate dataAgendada,

        @NotEmpty(message = "informe ao menos um tecnico")
        Set<Long> tecnicoIds,

        Set<Long> equipamentoIds,

        Set<Long> veiculoIds
) {
}
