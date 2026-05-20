package br.com.osals.ordemservico.dominio;

import java.util.Map;
import java.util.Set;

/**
 * Estados do ciclo de vida da Ordem de Servico.
 *
 * Fluxo: ABERTA -> IMPRESSA -> PENDENTE_DIGITACAO -> CONCLUIDA
 * (a digitacao pode ocorrer direto a partir de IMPRESSA).
 * Encerramento alternativo: CANCELADA.
 *
 * Ver documentacao/04-fluxo-servico-os.md.
 */
public enum StatusOrdemServico {

    ABERTA("Aberta"),
    IMPRESSA("Impressa"),
    PENDENTE_DIGITACAO("Pendente de digitacao"),
    CONCLUIDA("Concluida"),
    CANCELADA("Cancelada");

    private final String rotulo;

    StatusOrdemServico(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    /** Estados terminais: a OS nao pode mais ser alterada. */
    public boolean encerrada() {
        return this == CONCLUIDA || this == CANCELADA;
    }

    public boolean permiteTransicaoPara(StatusOrdemServico destino) {
        if (encerrada() || destino == this) {
            return false;
        }
        return PROXIMOS_ESTADOS.getOrDefault(this, Set.of()).contains(destino);
    }

    private static final Map<StatusOrdemServico, Set<StatusOrdemServico>> PROXIMOS_ESTADOS =
            Map.of(
                    ABERTA, Set.of(IMPRESSA, CANCELADA),
                    IMPRESSA, Set.of(PENDENTE_DIGITACAO, CONCLUIDA, CANCELADA),
                    PENDENTE_DIGITACAO, Set.of(CONCLUIDA, CANCELADA)
            );
}
