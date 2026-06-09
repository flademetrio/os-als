package br.com.osals.servico.aplicacao.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Requisicao de lancamento de custo. Os campos exigidos variam conforme a
 * categoria — a validacao por tipo acontece no GestorLancamentoCusto:
 *
 *  - ESTRUTURADO_MAO_OBRA: exige tecnicoId e horas (valor calculado pelo sistema)
 *  - ESTRUTURADO_DESLOCAMENTO: exige km (valor calculado pelo sistema)
 *  - LIVRE: exige valorTotalCentavos (informado direto)
 */
public record LancamentoCustoRequisicao(

        @NotNull(message = "categoriaCustoId e obrigatorio")
        Integer categoriaCustoId,

        @NotNull(message = "dataCusto e obrigatorio")
        LocalDate dataCusto,

        @Size(max = 255, message = "descricao deve ter no maximo 255 caracteres")
        String descricao,

        // Categorias livres
        @Min(value = 0, message = "valorTotalCentavos nao pode ser negativo")
        Long valorTotalCentavos,

        // Mao de obra
        Long tecnicoId,

        @DecimalMin(value = "0.00", inclusive = false, message = "horas deve ser maior que zero")
        BigDecimal horas,

        // Deslocamento
        @DecimalMin(value = "0.00", inclusive = false, message = "km deve ser maior que zero")
        BigDecimal km
) {
}
