package br.com.osals.servico.dominio;

/**
 * Empresa responsavel pelo Servico. Usada para separar relatorios por empresa
 * do grupo. Servicos abertos antes desta versao recebem ALS.
 */
public enum EmpresaServico {

    ALS("ALS"),
    FRYO("FRYO");

    private final String rotulo;

    EmpresaServico(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }
}
