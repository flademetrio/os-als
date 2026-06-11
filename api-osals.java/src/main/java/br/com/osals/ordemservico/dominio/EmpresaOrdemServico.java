package br.com.osals.ordemservico.dominio;

/**
 * Empresa responsavel pela Ordem de Servico. Usada para separar relatorios
 * por empresa do grupo. OS abertas antes desta versao recebem ALS.
 */
public enum EmpresaOrdemServico {

    ALS("ALS"),
    FRYO("FRYO");

    private final String rotulo;

    EmpresaOrdemServico(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }
}
