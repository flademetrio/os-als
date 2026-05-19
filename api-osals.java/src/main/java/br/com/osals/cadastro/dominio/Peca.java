package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "peca")
public class Peca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 255)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "unidade_medida_id")
    private UnidadeMedida unidadeMedida;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Peca() {
        // JPA
    }

    public Peca(String nome, String descricao, UnidadeMedida unidadeMedida) {
        this.nome = nome;
        this.descricao = descricao;
        this.unidadeMedida = unidadeMedida;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizar(String nome, String descricao, UnidadeMedida unidadeMedida) {
        this.nome = nome;
        this.descricao = descricao;
        this.unidadeMedida = unidadeMedida;
        this.updatedAt = OffsetDateTime.now();
    }

    public void inativar() { this.ativo = false; this.updatedAt = OffsetDateTime.now(); }
    public void reativar() { this.ativo = true; this.updatedAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public UnidadeMedida getUnidadeMedida() { return unidadeMedida; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
