package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.StatusServico;
import jakarta.validation.constraints.NotNull;

/**
 * Requisicao para mover o Servico entre estados intermediarios
 * (EM_ABERTO, EM_EXECUCAO, AGUARDANDO). Encerramentos usam endpoints proprios.
 */
public record MudancaStatusRequisicao(

        @NotNull(message = "status e obrigatorio")
        StatusServico status
) {
}
