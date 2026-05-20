package br.com.osals.relatorio.aplicacao.dto;

import java.math.BigDecimal;

/**
 * Linha do relatorio "Custos por Cliente": volume consolidado por cliente
 * no periodo. Valores monetarios em centavos.
 */
public record CustosPorClienteItem(
        Long clienteId,
        String clienteNome,
        long quantidadeServicos,
        long quantidadeOs,
        long custoTotalCentavos,
        BigDecimal markupPercentual,
        long precoVendaCentavos
) {
}
