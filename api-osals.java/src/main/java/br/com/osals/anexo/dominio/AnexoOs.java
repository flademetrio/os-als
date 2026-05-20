package br.com.osals.anexo.dominio;

import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Anexo PDF unico de uma OS: o scan do papel preenchido pelo tecnico.
 * Relacao 1:1 com OrdemServico — a PK e o proprio os_id (@MapsId).
 * Reanexar substitui o conteudo na mesma linha.
 */
@Entity
@Table(name = "anexo_os")
public class AnexoOs {

    @Id
    @Column(name = "os_id")
    private Long osId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "os_id")
    private OrdemServico ordemServico;

    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 60)
    private String contentType;

    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Usuario createdBy;

    protected AnexoOs() {
        // JPA
    }

    public AnexoOs(OrdemServico os, String nomeArquivo, String storageKey,
                   String contentType, long tamanhoBytes, Usuario criadoPor) {
        this.ordemServico = os;
        this.nomeArquivo = nomeArquivo;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.tamanhoBytes = tamanhoBytes;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    /** Substitui o conteudo do anexo (reanexo do scan). */
    public void substituir(String nomeArquivo, String storageKey,
                           String contentType, long tamanhoBytes, Usuario por) {
        this.nomeArquivo = nomeArquivo;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.tamanhoBytes = tamanhoBytes;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = por;
    }

    public Long getOsId() { return osId; }
    public OrdemServico getOrdemServico() { return ordemServico; }
    public String getNomeArquivo() { return nomeArquivo; }
    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
    public long getTamanhoBytes() { return tamanhoBytes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
}
