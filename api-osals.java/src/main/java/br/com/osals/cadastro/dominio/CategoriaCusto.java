package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 5 categorias seed da V1. Admin pode renomear e ativar/desativar,
 * mas NAO pode criar novas (cada tipo_lancamento esta acoplado a logica).
 *
 * O `codigo` e identificador estavel usado no codigo-fonte
 * (MAO_OBRA, DESLOCAMENTO, PECAS, TERCEIROS, HOSPEDAGEM).
 */
@Entity
@Table(name = "categoria_custo")
public class CategoriaCusto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, unique = true, length = 60)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_lancamento", nullable = false, length = 30)
    private TipoLancamentoCusto tipoLancamento;

    @Column(nullable = false)
    private boolean ativo = true;

    protected CategoriaCusto() {
        // JPA
    }

    public void atualizar(String nome, boolean ativo) {
        // codigo e tipo_lancamento sao IMUTAVEIS (chave estavel do app)
        this.nome = nome;
        this.ativo = ativo;
    }

    public Integer getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public TipoLancamentoCusto getTipoLancamento() { return tipoLancamento; }
    public boolean isAtivo() { return ativo; }
}
