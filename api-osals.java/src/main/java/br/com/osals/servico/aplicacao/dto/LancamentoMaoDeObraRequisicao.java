package br.com.osals.servico.aplicacao.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Lancamento de mao de obra para varios tecnicos de uma vez: cria um custo por
 * tecnico (mesma data e horas), com valor = valor/hora do tecnico x horas.
 */
public record LancamentoMaoDeObraRequisicao(

        @NotNull(message = "categoriaCustoId e obrigatorio")
        Integer categoriaCustoId,

        @NotNull(message = "dataCusto e obrigatorio")
        LocalDate dataCusto,

        @NotEmpty(message = "selecione ao menos um tecnico")
        List<Long> tecnicoIds,

        @NotNull(message = "horas e obrigatorio")
        @DecimalMin(value = "0.00", inclusive = false, message = "horas deve ser maior que zero")
        BigDecimal horas
) {
}
