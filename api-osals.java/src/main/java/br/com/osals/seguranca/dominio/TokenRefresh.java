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
 * Refresh token com rotacao. Cada uso revoga o anterior e emite novo.
 * Reuso de token revogado deve revogar toda a familia (deteccao de roubo).
 */
@Entity
@Table(name = "token_refresh")
public class TokenRefresh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "revogado_em")
    private OffsetDateTime revogadoEm;

    @ManyToOne
    @JoinColumn(name = "substituido_por_id")
    private TokenRefresh substituidoPor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected TokenRefresh() {
        // JPA
    }

    public TokenRefresh(Usuario usuario, String tokenHash, OffsetDateTime expiraEm) {
        this.usuario = usuario;
        this.tokenHash = tokenHash;
        this.expiraEm = expiraEm;
        this.createdAt = OffsetDateTime.now();
    }

    public boolean estaRevogado() {
        return revogadoEm != null;
    }

    public boolean estaExpirado() {
        return expiraEm.isBefore(OffsetDateTime.now());
    }

    public boolean estaValido() {
        return !estaRevogado() && !estaExpirado();
    }

    public void revogar() {
        if (revogadoEm == null) {
            revogadoEm = OffsetDateTime.now();
        }
    }

    public void revogarESubstituirPor(TokenRefresh novo) {
        revogar();
        this.substituidoPor = novo;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public String getTokenHash() { return tokenHash; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public OffsetDateTime getRevogadoEm() { return revogadoEm; }
    public TokenRefresh getSubstituidoPor() { return substituidoPor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
