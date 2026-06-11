package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.EmpresaServico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Dados para abrir um novo Servico. O numero e o status iniciais sao
 * atribuidos pelo sistema (numero sequencial; status EM_ABERTO).
 */
public record CriacaoServicoRequisicao(

        @NotNull(message = "clienteId e obrigatorio")
        Long clienteId,

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
