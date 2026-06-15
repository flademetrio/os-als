package br.com.osals.seguranca.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Token de redefinicao de senha por link. O admin gera (createdBy), o usuario
 * usa uma unica vez dentro da validade. Guardamos apenas o hash SHA-256 do token
 * (mesma abordagem do refresh token) — o valor cru so existe no link enviado.
 */
@Entity
@Table(name = "token_redefinicao_senha")
public class TokenRedefinicaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "usado_em")
    private OffsetDateTime usadoEm;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    protected TokenRedefinicaoSenha() {
        // JPA
    }

    public TokenRedefinicaoSenha(Usuario usuario, String tokenHash, OffsetDateTime expiraEm, Usuario criadoPor) {
        this.usuario = usuario;
        this.tokenHash = tokenHash;
        this.expiraEm = expiraEm;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    public boolean estaUsado() {
        return usadoEm != null;
    }

    public boolean estaExpirado() {
        return expiraEm.isBefore(OffsetDateTime.now());
    }

    public boolean estaValido() {
        return !estaUsado() && !estaExpirado();
    }

    public void marcarUsado() {
        if (usadoEm == null) {
            usadoEm = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public String getTokenHash() { return tokenHash; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public OffsetDateTime getUsadoEm() { return usadoEm; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
}
