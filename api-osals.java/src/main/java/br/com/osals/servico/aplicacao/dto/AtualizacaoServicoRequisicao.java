package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.EmpresaServico;
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

        @NotNull(message = "informe a empresa")
        EmpresaServico empresa,

        LocalDate dataInicioPrevista,
        LocalDate dataFimPrevista
) {
}
