package br.com.osals.seguranca.dominio;

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
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "versao_token", nullable = false)
    private int versaoToken = 1;

    @Column(name = "tentativas_login", nullable = false)
    private int tentativasLogin = 0;

    @Column(name = "bloqueado_ate")
    private OffsetDateTime bloqueadoAte;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    protected Usuario() {
        // JPA
    }

    public Usuario(String nome, String email, String senhaHash, Papel papel) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.papel = papel;
        this.ativo = true;
        this.versaoToken = 1;
        this.tentativasLogin = 0;
        this.createdAt = OffsetDateTime.now();
    }

    public boolean estaBloqueado() {
        return bloqueadoAte != null && bloqueadoAte.isAfter(OffsetDateTime.now());
    }

    public void registrarLoginComSucesso() {
        this.tentativasLogin = 0;
        this.bloqueadoAte = null;
    }

    public void registrarLoginFalho(int maxTentativas, int bloqueioMinutos) {
        this.tentativasLogin++;
        if (this.tentativasLogin >= maxTentativas) {
            this.bloqueadoAte = OffsetDateTime.now().plusMinutes(bloqueioMinutos);
            this.tentativasLogin = 0;
        }
    }

    public void invalidarTokens() {
        this.versaoToken++;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public Papel getPapel() { return papel; }
    public boolean isAtivo() { return ativo; }
    public int getVersaoToken() { return versaoToken; }
    public int getTentativasLogin() { return tentativasLogin; }
    public OffsetDateTime getBloqueadoAte() { return bloqueadoAte; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    // Setters limitados
    public void setNome(String nome) { this.nome = nome; this.updatedAt = OffsetDateTime.now(); }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; this.updatedAt = OffsetDateTime.now(); }
    public void setAtivo(boolean ativo) { this.ativo = ativo; this.updatedAt = OffsetDateTime.now(); }
    public void setPapel(Papel papel) { this.papel = papel; this.updatedAt = OffsetDateTime.now(); }
}
