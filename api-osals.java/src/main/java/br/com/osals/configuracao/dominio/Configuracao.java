package br.com.osals.configuracao.dominio;

import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "configuracao")
public class Configuracao {

    @Id
    @Column(length = 60)
    private String chave;

    @Column(nullable = false, length = 255)
    private String valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoValorConfiguracao tipo;

    @Column(length = 255)
    private String descricao;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;

    protected Configuracao() {
        // JPA
    }

    /**
     * Atualiza apenas o valor. Tipo, chave e descricao sao imutaveis via API
     * (admin nao cria ou renomeia chaves — sao definidas no codigo via migrations).
     */
    public void atualizarValor(String novoValor, Usuario autor) {
        this.valor = novoValor;
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = autor;
    }

    public String getChave() { return chave; }
    public String getValor() { return valor; }
    public TipoValorConfiguracao getTipo() { return tipo; }
    public String getDescricao() { return descricao; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
