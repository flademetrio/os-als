package br.com.osals.anexo.dominio;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.dominio.Servico;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/** Anexo PDF de um Servico. Multiplos por servico (ver documentacao/13). */
@Entity
@Table(name = "anexo_servico")
public class AnexoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false, updatable = false)
    private Servico servico;

    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @Column(length = 255)
    private String descricao;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 60)
    private String contentType;

    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    protected AnexoServico() {
        // JPA
    }

    public AnexoServico(Servico servico, String nomeArquivo, String descricao, String storageKey,
                        String contentType, long tamanhoBytes, Usuario criadoPor) {
        this.servico = servico;
        this.nomeArquivo = nomeArquivo;
        this.descricao = descricao;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.tamanhoBytes = tamanhoBytes;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    public Long getId() { return id; }
    public Servico getServico() { return servico; }
    public String getNomeArquivo() { return nomeArquivo; }
    public String getDescricao() { return descricao; }
    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
    public long getTamanhoBytes() { return tamanhoBytes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
}
