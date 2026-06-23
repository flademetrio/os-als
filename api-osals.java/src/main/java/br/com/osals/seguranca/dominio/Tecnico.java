package br.com.osals.seguranca.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Dados especificos quando o Usuario tem papel TECNICO. Relacao 1:1 com Usuario.
 *
 * O id e o mesmo do Usuario (chave compartilhada via @MapsId).
 */
@Entity
@Table(name = "tecnico")
public class Tecnico {

    @Id
    private Long usuarioId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "valor_hora_centavos", nullable = false)
    private long valorHoraCentavos;

    @Column(length = 80)
    private String especialidade;

    @Column(length = 20)
    private String telefone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Tecnico() {
        // JPA
    }

    public Tecnico(Usuario usuario, long valorHoraCentavos, String especialidade, String telefone) {
        this.usuario = usuario;
        this.valorHoraCentavos = valorHoraCentavos;
        this.especialidade = especialidade;
        this.telefone = telefone;
        this.createdAt = OffsetDateTime.now();
    }

    public Long getUsuarioId() { return usuarioId; }
    public Usuario getUsuario() { return usuario; }
    public long getValorHoraCentavos() { return valorHoraCentavos; }
    public String getEspecialidade() { return especialidade; }
    public String getTelefone() { return telefone; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void setValorHoraCentavos(long valor) { this.valorHoraCentavos = valor; this.updatedAt = OffsetDateTime.now(); }
    public void setEspecialidade(String e) { this.especialidade = e; this.updatedAt = OffsetDateTime.now(); }
    public void setTelefone(String t) { this.telefone = t; this.updatedAt = OffsetDateTime.now(); }
}
