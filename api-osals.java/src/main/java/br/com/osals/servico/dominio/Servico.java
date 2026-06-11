package br.com.osals.servico.dominio;

import br.com.osals.cadastro.dominio.Cliente;
import br.com.osals.cadastro.dominio.TipoServico;
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
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Servico — nucleo operacional do sistema. Vinculado a um Cliente e classificado
 * por um Tipo de Servico. Gera 1..N Ordens de Servico (modeladas na Fase 5).
 *
 * O numero e sequencial global (servico_numero_seq) e atribuido na criacao.
 */
@Entity
@Table(name = "servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private Integer numero;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false, updatable = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EmpresaServico empresa = EmpresaServico.ALS;

    @Column(name = "data_inicio_prevista")
    private LocalDate dataInicioPrevista;

    @Column(name = "data_fim_prevista")
    private LocalDate dataFimPrevista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusServico status = StatusServico.EM_ABERTO;

    @Column(name = "finalizado_em")
    private OffsetDateTime finalizadoEm;

    @ManyToOne
    @JoinColumn(name = "finalizado_por")
    private Usuario finalizadoPor;

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

    protected Servico() {
        // JPA
    }

    public Servico(Integer numero, Cliente cliente, TipoServico tipoServico, String descricao,
                   EmpresaServico empresa, LocalDate dataInicioPrevista, LocalDate dataFimPrevista,
                   Usuario criadoPor) {
        this.numero = numero;
        this.cliente = cliente;
        this.tipoServico = tipoServico;
        this.descricao = descricao;
        this.empresa = empresa != null ? empresa : EmpresaServico.ALS;
        this.dataInicioPrevista = dataInicioPrevista;
        this.dataFimPrevista = dataFimPrevista;
        this.status = StatusServico.EM_ABERTO;
        this.createdAt = OffsetDateTime.now();
        this.createdBy = criadoPor;
    }

    /** Servico em estado nao terminal pode ter seus dados editados. */
    public boolean podeEditar() {
        return !status.encerrado();
    }

    public boolean estaEncerrado() {
        return status.encerrado();
    }

    public boolean podeFinalizar() {
        return !status.encerrado();
    }

    /**
     * Atualiza os dados editaveis. Falha com 422 se o Servico ja estiver encerrado.
     */
    public void atualizarDados(TipoServico tipoServico, String descricao, EmpresaServico empresa,
                               LocalDate dataInicioPrevista, LocalDate dataFimPrevista, Usuario por) {
        if (!podeEditar()) {
            throw new NegocioException(
                    "Servico " + status.getRotulo().toLowerCase() + " nao pode ser editado.");
        }
        this.tipoServico = tipoServico;
        this.descricao = descricao;
        if (empresa != null) {
            this.empresa = empresa;
        }
        this.dataInicioPrevista = dataInicioPrevista;
        this.dataFimPrevista = dataFimPrevista;
        marcarAtualizacao(por);
    }

    /**
     * Move o Servico para um estado intermediario (EM_ABERTO, EM_EXECUCAO, AGUARDANDO).
     * Para CONCLUIDO use {@link #finalizar}; para CANCELADO use {@link #cancelar}.
     */
    public void mudarStatus(StatusServico destino, Usuario por) {
        if (destino == StatusServico.CONCLUIDO || destino == StatusServico.CANCELADO) {
            throw new NegocioException(
                    "Use a acao de finalizar ou cancelar para encerrar o Servico.");
        }
        transicionar(destino, por);
    }

    /** Encerra o Servico como CONCLUIDO, registrando autor e data. */
    public void finalizar(Usuario por) {
        transicionar(StatusServico.CONCLUIDO, por);
        this.finalizadoEm = OffsetDateTime.now();
        this.finalizadoPor = por;
    }

    /** Encerra o Servico como CANCELADO. */
    public void cancelar(Usuario por) {
        transicionar(StatusServico.CANCELADO, por);
        this.finalizadoEm = OffsetDateTime.now();
        this.finalizadoPor = por;
    }

    private void transicionar(StatusServico destino, Usuario por) {
        if (!status.permiteTransicaoPara(destino)) {
            throw new NegocioException("Nao e possivel mudar o status de "
                    + status.getRotulo() + " para " + destino.getRotulo() + ".");
        }
        this.status = destino;
        marcarAtualizacao(por);
    }

    private void marcarAtualizacao(Usuario por) {
        this.updatedAt = OffsetDateTime.now();
        this.updatedBy = por;
    }

    public Long getId() { return id; }
    public Integer getNumero() { return numero; }
    public Cliente getCliente() { return cliente; }
    public TipoServico getTipoServico() { return tipoServico; }
    public String getDescricao() { return descricao; }
    public EmpresaServico getEmpresa() { return empresa; }
    public LocalDate getDataInicioPrevista() { return dataInicioPrevista; }
    public LocalDate getDataFimPrevista() { return dataFimPrevista; }
    public StatusServico getStatus() { return status; }
    public OffsetDateTime getFinalizadoEm() { return finalizadoEm; }
    public Usuario getFinalizadoPor() { return finalizadoPor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public Usuario getUpdatedBy() { return updatedBy; }
}
