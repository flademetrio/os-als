package br.com.osals.ordemservico.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

/**
 * Dados para abrir uma OS dentro de um Servico.
 * Tecnicos e equipamentos sao obrigatorios (1..N); veiculos sao opcionais.
 */
public record AberturaOsRequisicao(

        @NotBlank(message = "descricaoAtividade e obrigatoria")
        String descricaoAtividade,

        @NotEmpty(message = "informe ao menos um tecnico")
        Set<Long> tecnicoIds,

        @NotEmpty(message = "informe ao menos um equipamento")
        Set<Long> equipamentoIds,

        Set<Long> veiculoIds
) {
}
