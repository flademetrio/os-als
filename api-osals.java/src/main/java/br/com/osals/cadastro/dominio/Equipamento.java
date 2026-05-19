package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Equipamento de climatizacao instalado em uma unidade do cliente.
 *
 * Entidade ⭐ do dominio — historico de manutencao por equipamento via OS
 * (ver documentacao/03 §Equipamento e documentacao/08).
 */
@Entity
@Table(name = "equipamento")
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "unidade_id", nullable = false)
    private Unidade unidade;

    @Column(length = 60)
    private String marca;

    @Column(length = 60)
    private String modelo;

    @Column(name = "numero_serie", length = 60)
    private String numeroSerie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEquipamento tipo;

    @Column(name = "capacidade_btus")
    private Integer capacidadeBtus;

    @Column(name = "capacidade_tr", precision = 6, scale = 2)
    private BigDecimal capacidadeTr;

    @Column(name = "localizacao_interna", length = 120)
    private String localizacaoInterna;

    @Column(name = "data_instalacao")
    private LocalDate dataInstalacao;

    @Column(name = "data_ultima_manutencao")
    private LocalDate dataUltimaManutencao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusEquipamento status = StatusEquipamento.ATIVO;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Equipamento() {
        // JPA
    }

    public Equipamento(Unidade unidade, TipoEquipamento tipo) {
        this.unidade = unidade;
        this.tipo = tipo;
        this.status = StatusEquipamento.ATIVO;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizarDados(
            String marca, String modelo, String numeroSerie, TipoEquipamento tipo,
            Integer capacidadeBtus, BigDecimal capacidadeTr,
            String localizacaoInterna, LocalDate dataInstalacao, LocalDate dataUltimaManutencao,
            StatusEquipamento status
    ) {
        this.marca = marca;
        this.modelo = modelo;
        this.numeroSerie = numeroSerie;
        this.tipo = tipo;
        this.capacidadeBtus = capacidadeBtus;
        this.capacidadeTr = capacidadeTr;
        this.localizacaoInterna = localizacaoInterna;
        this.dataInstalacao = dataInstalacao;
        this.dataUltimaManutencao = dataUltimaManutencao;
        if (status != null) this.status = status;
        this.updatedAt = OffsetDateTime.now();
    }

    public void inativar() {
        this.ativo = false;
        this.updatedAt = OffsetDateTime.now();
    }

    public void reativar() {
        this.ativo = true;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Unidade getUnidade() { return unidade; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public String getNumeroSerie() { return numeroSerie; }
    public TipoEquipamento getTipo() { return tipo; }
    public Integer getCapacidadeBtus() { return capacidadeBtus; }
    public BigDecimal getCapacidadeTr() { return capacidadeTr; }
    public String getLocalizacaoInterna() { return localizacaoInterna; }
    public LocalDate getDataInstalacao() { return dataInstalacao; }
    public LocalDate getDataUltimaManutencao() { return dataUltimaManutencao; }
    public StatusEquipamento getStatus() { return status; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
