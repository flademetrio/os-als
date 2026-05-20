package br.com.osals.relatorio.aplicacao.dto;

import br.com.osals.servico.dominio.StatusServico;
import java.math.BigDecimal;

/**
 * Linha do relatorio "Custos por Servico". Custo desmembrado nas 5 categorias,
 * custo total, markup aplicado e preco de venda. Valores em centavos.
 */
public record CustosPorServicoItem(
        Long servicoId,
        Integer numero,
        String numeroFormatado,
        Long clienteId,
        String clienteNome,
        String descricao,
        StatusServico status,
        String statusRotulo,
        long maoObraCentavos,
        long deslocamentoCentavos,
        long pecasCentavos,
        long terceirosCentavos,
        long hospedagemCentavos,
        long custoTotalCentavos,
        BigDecimal markupPercentual,
        long precoVendaCentavos
) {
}
