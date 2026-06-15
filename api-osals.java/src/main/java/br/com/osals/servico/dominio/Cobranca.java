package br.com.osals.servico.dominio;

import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.seguranca.dominio.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * Cobranca de um Servico (1:1). Define como o servico e cobrado e, quando do
 * tipo COBRADO, guarda o valor e o estado do faturamento (das notas fiscais).
 */
@Entity
@Table(name = "cobranca")
public class Cobranca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false, unique = true, updatable = false)
    private Servico servico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TipoCobranca tipo = TipoCobranca.SEM_COBRANCA;

    @Column(name = "valor_centavos")
    private Long valorCentavos;

    @Column(name = "dias_previstos")
    private Integer diasPrevistos;

    @Column(name = "qtde_pessoas")
    private Integer qtdePessoas;

    @Column(columnDefinition = "TEXT")
    private String obs;

    @Enumerated(EnumType.STRING)
    @Column(name = "faturamento_status", nullable = false, length = 12)
    private StatusFaturamento faturamentoStatus = StatusFaturamento.AGUARDANDO;

    @Column(name = "fechado_em")
    private OffsetDateTime fechadoEm;

    @ManyToOne
    @JoinColumn(name = "fechado_por")
    private Usuario fechadoPor;

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

    protected Cobranca() {
        // JPA
    }

    public Cobranca(Servico servico, Usuario criadoPor) {
        this.servico = servico;
        this.tipo = TipoCobranca.SEM_COBRANCA;
        this.faturamentoStatus = StatusFaturamento.AGUARDANDO;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    /**
     * Atualiza os dados da cobranca. Valor e obrigatorio quando COBRADO e zerado
     * nos demais tipos. Ao deixar de ser COBRADO, o faturamento volta a AGUARDANDO
     * (e perde o fechamento, se houver) porque deixa de se aplicar.
     */
    public void editar(TipoCobranca tipo, Long valorCentavos, Integer diasPrevistos,
                       Integer qtdePessoas, String obs, Usuario por) {
        if (tipo == null) {
            throw new NegocioException("Informe o tipo de cobranca.");
        }
        if (tipo == TipoCobranca.COBRADO) {
            if (valorCentavos == null) {
                throw new NegocioException("Informe o valor para cobranca do tipo Cobrado.");
            }
            if (valorCentavos < 0) {
                throw new NegocioException("O valor da cobranca nao pode ser negativo.");
            }
            this.valorCentavos = valorCentavos;
        } else {
            this.valorCentavos = null;
            if (this.faturamentoStatus == StatusFaturamento.FECHADO) {
                this.faturamentoStatus = StatusFaturamento.AGUARDANDO;
                this.fechadoEm = null;
                this.fechadoPor = null;
            }
        }
        this.tipo = tipo;
        this.diasPrevistos = diasPrevistos;
        this.qtdePessoas = qtdePessoas;
        this.obs = obs;
        marcarAtualizacao(por);
    }

    /** Fecha o faturamento. O gestor ja validou que a soma das NFs == valor. */
    public void fechar(Usuario por) {
        if (tipo != TipoCobranca.COBRADO) {
            throw new NegocioException("So e possivel fechar o faturamento de uma cobranca do tipo Cobrado.");
        }
        if (faturamentoStatus == StatusFaturamento.FECHADO) {
            throw new NegocioException("Faturamento ja esta fechado.");
        }
        this.faturamentoStatus = StatusFaturamento.FECHADO;
        this.fechadoEm = OffsetDateTime.now();
        this.fechadoPor = por;
        marcarAtualizacao(por);
    }

    /** Reabre um faturamento fechado (operacao administrativa). */
    public void reabrir(Usuario por) {
        if (faturamentoStatus != StatusFaturamento.FECHADO) {
            throw new NegocioException("Apenas faturamento fechado pode ser reaberto.");
        }
        this.faturamentoStatus = StatusFaturamento.AGUARDANDO;
        this.fechadoEm = null;
        this.fechadoPor = null;
        marcarAtualizacao(por);
    }

    public boolean ehCobrado() {
        return tipo == TipoCobranca.COBRADO;
    }

    public boolean faturamentoFechado() {
        return faturamentoStatus == StatusFaturamento.FECHADO;
    }

    private void marcarAtualizacao(Usuario por) {
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public Long getId() { return id; }
    public Servico getServico() { return servico; }
    public TipoCobranca getTipo() { return tipo; }
    public Long getValorCentavos() { return valorCentavos; }
    public Integer getDiasPrevistos() { return diasPrevistos; }
    public Integer getQtdePessoas() { return qtdePessoas; }
    public String getObs() { return obs; }
    public StatusFaturamento getFaturamentoStatus() { return faturamentoStatus; }
    public OffsetDateTime getFechadoEm() { return fechadoEm; }
    public Usuario getFechadoPor() { return fechadoPor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
