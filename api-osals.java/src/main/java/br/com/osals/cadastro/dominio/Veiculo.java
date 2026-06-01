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
@Table(name = "veiculo")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 8)
    private String placa;

    @Column(length = 40)
    private String marca;

    @Column(length = 60)
    private String modelo;

    private Integer ano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusVeiculo status = StatusVeiculo.ATIVO;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Veiculo() {
        // JPA
    }

    public Veiculo(String placa) {
        this.placa = placa;
        this.status = StatusVeiculo.ATIVO;
        this.ativo = true;
        this.createdAt = OffsetDateTime.now();
    }

    public void atualizarDados(String marca, String modelo, Integer ano, StatusVeiculo status) {
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        if (status != null) this.status = status;
        this.updatedAt = OffsetDateTime.now();
    }

    /** Troca a placa. A unicidade e validada pelo Servico antes de chamar. */
    public void mudarPlaca(String novaPlaca) {
        this.placa = novaPlaca;
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
    public String getPlaca() { return placa; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public Integer getAno() { return ano; }
    public StatusVeiculo getStatus() { return status; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
