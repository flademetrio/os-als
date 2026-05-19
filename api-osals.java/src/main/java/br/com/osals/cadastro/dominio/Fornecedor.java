package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fornecedor")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", length = 2)
    private TipoPessoa tipoPessoa;

    @Column(length = 14)
    private String documento;

    @Column(length = 20)
    private String telefone;

    @Column(length = 160)
    private String email;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Fornecedor() {
        // JPA
    }

    public Fornecedor(String nome) {
        this.nome = nome;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizar(String nome, TipoPessoa tipoPessoa, String documento,
                          String telefone, String email) {
        this.nome = nome;
        this.tipoPessoa = tipoPessoa;
        this.documento = documento;
        this.telefone = telefone;
        this.email = email;
        this.updatedAt = OffsetDateTime.now();
    }

    public void inativar() { this.ativo = false; this.updatedAt = OffsetDateTime.now(); }
    public void reativar() { this.ativo = true; this.updatedAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public TipoPessoa getTipoPessoa() { return tipoPessoa; }
    public String getDocumento() { return documento; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
