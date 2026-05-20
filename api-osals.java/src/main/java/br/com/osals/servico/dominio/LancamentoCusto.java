package br.com.osals.servico.dominio;

import br.com.osals.cadastro.dominio.CategoriaCusto;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Lancamento de custo de um Servico. Tabela unica para as 5 categorias.
 *
 * Mao de obra e deslocamento sao "estruturados": o valor total e calculado
 * pelo sistema e os campos de snapshot preservam o valor/hora e valor/km
 * vigentes no momento do lancamento. Demais categorias sao livres
 * (descricao + valor informado direto).
 */
@Entity
@Table(name = "lancamento_custo")
public class LancamentoCusto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false, updatable = false)
    private Servico servico;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_custo_id", nullable = false)
    private CategoriaCusto categoriaCusto;

    @Column(length = 255)
    private String descricao;

    @Column(name = "valor_total_centavos", nullable = false)
    private long valorTotalCentavos;

    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Tecnico tecnico;

    @Column(precision = 6, scale = 2)
    private BigDecimal horas;

    @Column(name = "valor_hora_snapshot_centavos")
    private Long valorHoraSnapshotCentavos;

    @Column(precision = 8, scale = 2)
    private BigDecimal km;

    @Column(name = "valor_km_snapshot_centavos")
    private Long valorKmSnapshotCentavos;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;

    protected LancamentoCusto() {
        // JPA
    }

    public LancamentoCusto(Servico servico, Usuario criadoPor) {
        this.servico = servico;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    /** Lancamento de categoria livre: descricao + valor informado direto. */
    public void aplicarLivre(CategoriaCusto categoria, String descricao, long valorTotalCentavos) {
        this.categoriaCusto = categoria;
        this.descricao = descricao;
        this.valorTotalCentavos = valorTotalCentavos;
        limparEstruturados();
    }

    /** Lancamento de mao de obra: valor = horas x valor/hora (snapshot do tecnico). */
    public void aplicarMaoDeObra(CategoriaCusto categoria, String descricao, Tecnico tecnico,
                                 BigDecimal horas, long valorHoraSnapshotCentavos, long valorTotalCentavos) {
        this.categoriaCusto = categoria;
        this.descricao = descricao;
        this.valorTotalCentavos = valorTotalCentavos;
        this.tecnico = tecnico;
        this.horas = horas;
        this.valorHoraSnapshotCentavos = valorHoraSnapshotCentavos;
        this.km = null;
        this.valorKmSnapshotCentavos = null;
    }

    /** Lancamento de deslocamento: valor = km x valor/km (snapshot da configuracao). */
    public void aplicarDeslocamento(CategoriaCusto categoria, String descricao,
                                    BigDecimal km, long valorKmSnapshotCentavos, long valorTotalCentavos) {
        this.categoriaCusto = categoria;
        this.descricao = descricao;
        this.valorTotalCentavos = valorTotalCentavos;
        this.km = km;
        this.valorKmSnapshotCentavos = valorKmSnapshotCentavos;
        this.tecnico = null;
        this.horas = null;
        this.valorHoraSnapshotCentavos = null;
    }

    public void marcarAtualizadoPor(Usuario por) {
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    private void limparEstruturados() {
        this.tecnico = null;
        this.horas = null;
        this.valorHoraSnapshotCentavos = null;
        this.km = null;
        this.valorKmSnapshotCentavos = null;
    }

    public Long getId() { return id; }
    public Servico getServico() { return servico; }
    public CategoriaCusto getCategoriaCusto() { return categoriaCusto; }
    public String getDescricao() { return descricao; }
    public long getValorTotalCentavos() { return valorTotalCentavos; }
    public Tecnico getTecnico() { return tecnico; }
    public BigDecimal getHoras() { return horas; }
    public Long getValorHoraSnapshotCentavos() { return valorHoraSnapshotCentavos; }
    public BigDecimal getKm() { return km; }
    public Long getValorKmSnapshotCentavos() { return valorKmSnapshotCentavos; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
