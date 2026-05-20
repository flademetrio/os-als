package br.com.osals.servico.aplicacao.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resumo financeiro de um Servico: custo agregado por categoria, custo total,
 * markup vigente e preco de venda. Todos os valores monetarios em centavos.
 *
 * preco_venda = custo_total x (1 + markup_percentual / 100)
 */
public record ResumoFinanceiroServico(
        Long servicoId,
        List<CustoPorCategoria> custosPorCategoria,
        long custoTotalCentavos,
        BigDecimal markupPercentual,
        long precoVendaCentavos
) {

    /** Custo agregado de uma categoria. */
    public record CustoPorCategoria(
            Integer categoriaCustoId,
            String categoriaCodigo,
            String categoriaNome,
            int quantidadeLancamentos,
            long subtotalCentavos
    ) {
    }
}
