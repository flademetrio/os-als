package br.com.osals.cadastro.dominio;

/**
 * Tipo de lançamento que a categoria de custo aceita.
 *
 * - ESTRUTURADO_MAO_OBRA: exige tecnico_id, horas, valor_hora_snapshot
 * - ESTRUTURADO_DESLOCAMENTO: exige km, valor_km_snapshot
 * - LIVRE: aceita apenas descricao + valor_total
 *
 * Ver documentacao/06-custos.md e 08-modelo-de-dados.md §5.
 */
public enum TipoLancamentoCusto {
    ESTRUTURADO_MAO_OBRA,
    ESTRUTURADO_DESLOCAMENTO,
    LIVRE
}
