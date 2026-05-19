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
@Table(name = "contato_cliente")
public class ContatoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 60)
    private String funcao;

    @Column(length = 20)
    private String telefone;

    @Column(length = 160)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected ContatoCliente() {
        // JPA
    }

    public ContatoCliente(Cliente cliente, String nome, String funcao, String telefone, String email) {
        this.cliente = cliente;
        this.nome = nome;
        this.funcao = funcao;
        this.telefone = telefone;
        this.email = email;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizar(String nome, String funcao, String telefone, String email) {
        this.nome = nome;
        this.funcao = funcao;
        this.telefone = telefone;
        this.email = email;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public String getNome() { return nome; }
    public String getFuncao() { return funcao; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
