package br.com.osals.cadastro.dominio;

import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false, length = 2)
    private TipoPessoa tipoPessoa;

    @Column(nullable = false, unique = true, length = 14)
    private String documento;

    @Column(nullable = false, length = 160)
    private String nome;

    @Column(name = "nome_fantasia", length = 160)
    private String nomeFantasia;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;

    protected Cliente() {
        // JPA
    }

    public Cliente(TipoPessoa tipoPessoa, String documento, String nome, String nomeFantasia, Usuario criadoPor) {
        this.tipoPessoa = tipoPessoa;
        this.documento = documento;
        this.nome = nome;
        this.nomeFantasia = nomeFantasia;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    public void atualizar(String nome, String nomeFantasia, Usuario por) {
        this.nome = nome;
        this.nomeFantasia = nomeFantasia;
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public void inativar(Usuario por) {
        this.ativo = false;
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public void reativar(Usuario por) {
        this.ativo = true;
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public Long getId() { return id; }
    public TipoPessoa getTipoPessoa() { return tipoPessoa; }
    public String getDocumento() { return documento; }
    public String getNome() { return nome; }
    public String getNomeFantasia() { return nomeFantasia; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
