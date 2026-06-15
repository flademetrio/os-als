package br.com.osals.servico.dominio;

import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Nota fiscal emitida no faturamento de um Servico (1:N). A soma das NFs precisa
 * bater com o valor da cobranca para o faturamento poder ser fechado.
 */
@Entity
@Table(name = "nota_fiscal")
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false, updatable = false)
    private Servico servico;

    @Column(nullable = false, length = 40)
    private String numero;

    @Column(name = "data_emissao", nullable = false)
    private LocalDate dataEmissao;

    @Column(name = "valor_centavos", nullable = false)
    private long valorCentavos;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;

    protected NotaFiscal() {
        // JPA
    }

    public NotaFiscal(Servico servico, Usuario criadoPor) {
        this.servico = servico;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    public void aplicar(String numero, LocalDate dataEmissao, long valorCentavos) {
        this.numero = numero;
        this.dataEmissao = dataEmissao;
        this.valorCentavos = valorCentavos;
    }

    public void marcarAtualizadoPor(Usuario por) {
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public Long getId() { return id; }
    public Servico getServico() { return servico; }
    public String getNumero() { return numero; }
    public LocalDate getDataEmissao() { return dataEmissao; }
    public long getValorCentavos() { return valorCentavos; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
