package br.com.osals.servico.dominio;

/**
 * Como o Servico e cobrado do cliente. So COBRADO gera faturamento (NFs).
 */
public enum TipoCobranca {

    COBRADO("Cobrado"),
    GARANTIA("Garantia"),
    ORCAMENTO("Orcamento"),
    SEM_COBRANCA("Sem cobranca");

    private final String rotulo;

    TipoCobranca(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }
}
