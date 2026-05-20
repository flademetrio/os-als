package br.com.osals.servico.aplicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Dados editaveis de um Servico. O cliente nao pode ser alterado apos a criacao.
 */
public record AtualizacaoServicoRequisicao(

        @NotNull(message = "tipoServicoId e obrigatorio")
        Integer tipoServicoId,

        @NotBlank(message = "descricao e obrigatoria")
        String descricao,

        LocalDate dataInicioPrevista,
        LocalDate dataFimPrevista
) {
}
