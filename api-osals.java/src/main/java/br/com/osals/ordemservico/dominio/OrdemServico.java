package br.com.osals.ordemservico.dominio;

import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.Veiculo;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.dominio.Servico;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Ordem de Servico (OS) — atividade operacional dentro de um Servico.
 *
 * Ciclo: ABERTA -> IMPRESSA -> (PENDENTE_DIGITACAO) -> CONCLUIDA, ou CANCELADA.
 * O numero e sequencial global (os_numero_seq), exibido com 5 digitos.
 */
@Entity
@Table(name = "ordem_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private Integer numero;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false, updatable = false)
    private Servico servico;

    @Column(name = "descricao_atividade", nullable = false, columnDefinition = "TEXT")
    private String descricaoAtividade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private StatusOrdemServico status = StatusOrdemServico.ABERTA;

    @Column(name = "data_abertura", nullable = false, updatable = false)
    private OffsetDateTime dataAbertura;

    @Column(name = "data_impressao")
    private OffsetDateTime dataImpressao;

    @Column(name = "hora_inicio_execucao")
    private OffsetDateTime horaInicioExecucao;

    @Column(name = "hora_fim_execucao")
    private OffsetDateTime horaFimExecucao;

    @Column(name = "o_que_foi_feito", columnDefinition = "TEXT")
    private String oQueFoiFeito;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(columnDefinition = "TEXT")
    private String impedimentos;

    @Column(name = "digitado_em")
    private OffsetDateTime digitadoEm;

    @ManyToOne
    @JoinColumn(name = "digitado_por")
    private Usuario digitadoPor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private Usuario createdBy;

    @ManyToMany
    @JoinTable(
            name = "os_tecnico",
            joinColumns = @JoinColumn(name = "os_id"),
            inverseJoinColumns = @JoinColumn(name = "tecnico_id"))
    private Set<Tecnico> tecnicos = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "os_veiculo",
            joinColumns = @JoinColumn(name = "os_id"),
            inverseJoinColumns = @JoinColumn(name = "veiculo_id"))
    private Set<Veiculo> veiculos = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "os_equipamento",
            joinColumns = @JoinColumn(name = "os_id"),
            inverseJoinColumns = @JoinColumn(name = "equipamento_id"))
    private Set<Equipamento> equipamentos = new LinkedHashSet<>();

    protected OrdemServico() {
        // JPA
    }

    public OrdemServico(Integer numero, Servico servico, String descricaoAtividade, Usuario criadoPor) {
        this.numero = numero;
        this.servico = servico;
        this.descricaoAtividade = descricaoAtividade;
        this.status = StatusOrdemServico.ABERTA;
        this.dataAbertura = OffsetDateTime.now();
        this.createdAt = this.dataAbertura;
        this.createdBy = criadoPor;
    }

    public boolean estaEncerrada() {
        return status.encerrada();
    }

    public void definirEquipe(Set<Tecnico> tecnicos, Set<Veiculo> veiculos, Set<Equipamento> equipamentos) {
        this.tecnicos = new LinkedHashSet<>(tecnicos);
        this.veiculos = new LinkedHashSet<>(veiculos);
        this.equipamentos = new LinkedHashSet<>(equipamentos);
    }

    /**
     * Marca a OS como impressa e registra a data. Pode ser reimpressa enquanto
     * nao encerrada (a reimpressao apenas atualiza a data).
     */
    public void imprimir() {
        if (estaEncerrada()) {
            throw new NegocioException(
                    "OS " + status.getRotulo().toLowerCase() + " nao pode ser impressa.");
        }
        if (status == StatusOrdemServico.ABERTA) {
            status = StatusOrdemServico.IMPRESSA;
        }
        this.dataImpressao = OffsetDateTime.now();
    }

    /** Marca que o papel preenchido voltou e aguarda digitacao. */
    public void marcarDevolvida() {
        transicionar(StatusOrdemServico.PENDENTE_DIGITACAO);
    }

    /**
     * Registra os dados de execucao preenchidos pela equipe e conclui a OS.
     * Permitido a partir de IMPRESSA ou PENDENTE_DIGITACAO.
     */
    public void digitarExecucao(OffsetDateTime horaInicio, OffsetDateTime horaFim,
                                String oQueFoiFeito, String observacoes, String impedimentos,
                                Usuario digitadoPor) {
        if (status != StatusOrdemServico.IMPRESSA && status != StatusOrdemServico.PENDENTE_DIGITACAO) {
            throw new NegocioException(
                    "So e possivel digitar a execucao de uma OS impressa. Status atual: "
                            + status.getRotulo() + ".");
        }
        this.horaInicioExecucao = horaInicio;
        this.horaFimExecucao = horaFim;
        this.oQueFoiFeito = oQueFoiFeito;
        this.observacoes = observacoes;
        this.impedimentos = impedimentos;
        this.digitadoEm = OffsetDateTime.now();
        this.digitadoPor = digitadoPor;
        this.status = StatusOrdemServico.CONCLUIDA;
    }

    public void cancelar() {
        transicionar(StatusOrdemServico.CANCELADA);
    }

    private void transicionar(StatusOrdemServico destino) {
        if (!status.permiteTransicaoPara(destino)) {
            throw new NegocioException("Nao e possivel mudar a OS de "
                    + status.getRotulo() + " para " + destino.getRotulo() + ".");
        }
        this.status = destino;
    }

    public Long getId() { return id; }
    public Integer getNumero() { return numero; }
    public Servico getServico() { return servico; }
    public String getDescricaoAtividade() { return descricaoAtividade; }
    public StatusOrdemServico getStatus() { return status; }
    public OffsetDateTime getDataAbertura() { return dataAbertura; }
    public OffsetDateTime getDataImpressao() { return dataImpressao; }
    public OffsetDateTime getHoraInicioExecucao() { return horaInicioExecucao; }
    public OffsetDateTime getHoraFimExecucao() { return horaFimExecucao; }
    public String getOQueFoiFeito() { return oQueFoiFeito; }
    public String getObservacoes() { return observacoes; }
    public String getImpedimentos() { return impedimentos; }
    public OffsetDateTime getDigitadoEm() { return digitadoEm; }
    public Usuario getDigitadoPor() { return digitadoPor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Usuario getCreatedBy() { return createdBy; }
    public Set<Tecnico> getTecnicos() { return tecnicos; }
    public Set<Veiculo> getVeiculos() { return veiculos; }
    public Set<Equipamento> getEquipamentos() { return equipamentos; }
}
