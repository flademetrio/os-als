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
@Table(name = "unidade")
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "identificacao_interna", nullable = false, length = 80)
    private String identificacaoInterna;

    @Column(length = 8)
    private String cep;

    @Column(length = 160)
    private String logradouro;

    @Column(length = 20)
    private String numero;

    @Column(length = 80)
    private String complemento;

    @Column(length = 80)
    private String bairro;

    @Column(length = 80)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Unidade() {
        // JPA
    }

    public Unidade(Cliente cliente, String identificacaoInterna) {
        this.cliente = cliente;
        this.identificacaoInterna = identificacaoInterna;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizar(
            String identificacaoInterna,
            String cep, String logradouro, String numero, String complemento,
            String bairro, String cidade, String estado
    ) {
        this.identificacaoInterna = identificacaoInterna;
        this.cep = cep;
        this.logradouro = logradouro;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.updatedAt = OffsetDateTime.now();
    }

    public void inativar() {
        this.ativo = false;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public String getIdentificacaoInterna() { return identificacaoInterna; }
    public String getCep() { return cep; }
    public String getLogradouro() { return logradouro; }
    public String getNumero() { return numero; }
    public String getComplemento() { return complemento; }
    public String getBairro() { return bairro; }
    public String getCidade() { return cidade; }
    public String getEstado() { return estado; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
