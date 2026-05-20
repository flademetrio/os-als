package br.com.osals.servico.dominio;

import java.util.Set;

/**
 * Estados do ciclo de vida do Servico.
 *
 * Fluxo: EM_ABERTO -> EM_EXECUCAO -> AGUARDANDO -> CONCLUIDO
 * Encerramento alternativo: CANCELADO (a partir de qualquer estado nao encerrado).
 *
 * Ver documentacao/04-fluxo-servico-os.md.
 */
public enum StatusServico {

    EM_ABERTO("Em aberto"),
    EM_EXECUCAO("Em execucao"),
    AGUARDANDO("Aguardando"),
    CONCLUIDO("Concluido"),
    CANCELADO("Cancelado");

    private final String rotulo;

    StatusServico(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    /** Estados terminais: o Servico nao pode mais ser editado nem transicionado. */
    public boolean encerrado() {
        return this == CONCLUIDO || this == CANCELADO;
    }

    /**
     * Indica se a transicao deste estado para {@code destino} e permitida.
     * Estados encerrados nao permitem nenhuma transicao.
     */
    public boolean permiteTransicaoPara(StatusServico destino) {
        if (encerrado() || destino == this) {
            return false;
        }
        return PROXIMOS_ESTADOS.getOrDefault(this, Set.of()).contains(destino);
    }

    private static final java.util.Map<StatusServico, Set<StatusServico>> PROXIMOS_ESTADOS =
            java.util.Map.of(
                    EM_ABERTO, Set.of(EM_EXECUCAO, AGUARDANDO, CONCLUIDO, CANCELADO),
                    EM_EXECUCAO, Set.of(EM_ABERTO, AGUARDANDO, CONCLUIDO, CANCELADO),
                    AGUARDANDO, Set.of(EM_ABERTO, EM_EXECUCAO, CONCLUIDO, CANCELADO)
            );
}
