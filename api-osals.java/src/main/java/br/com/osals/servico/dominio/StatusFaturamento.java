package br.com.osals.servico.dominio;

/**
 * Estado do faturamento de uma cobranca do tipo COBRADO. Nasce AGUARDANDO e vira
 * FECHADO quando a soma das notas fiscais bate com o valor da cobranca.
 */
public enum StatusFaturamento {

    AGUARDANDO("Aguardando"),
    FECHADO("Fechado");

    private final String rotulo;

    StatusFaturamento(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }
}
