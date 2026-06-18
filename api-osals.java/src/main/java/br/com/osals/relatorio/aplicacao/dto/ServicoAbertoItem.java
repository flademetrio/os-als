package br.com.osals.relatorio.aplicacao.dto;

/**
 * Linha do relatorio de servicos abertos (status nao encerrado). Valor e o da
 * cobranca quando o servico e do tipo Cobrado; nulo nos demais.
 */
public record ServicoAbertoItem(
        Long servicoId,
        Integer numero,
        String numeroFormatado,
        Long clienteId,
        String clienteNome,
        String tipoServicoNome,
        String descricao,
        String statusRotulo,
        boolean cobrado,
        long numeroOs,
        Long valorCentavos
) {
}
