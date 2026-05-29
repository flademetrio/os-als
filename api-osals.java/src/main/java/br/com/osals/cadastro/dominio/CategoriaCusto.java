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
 * Categoria de custo. As 5 seeds (MAO_OBRA, DESLOCAMENTO, PECAS, TERCEIROS,
 * HOSPEDAGEM) sao criadas pela migration V014; admin pode renomear, ativar
 * ou desativar qualquer uma. Categorias novas criadas pelo admin entram
 * sempre como tipo LIVRE — os tipos ESTRUTURADO_* estao acoplados a logica
 * do app e nao podem ser criados/excluidos dinamicamente.
 *
 * O `codigo` e identificador estavel usado no codigo-fonte. Para seeds vem
 * fixo; para categorias criadas pelo admin e gerado a partir do nome.
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

    /** Cria uma categoria nova pelo admin — sempre do tipo LIVRE e ativa. */
    public CategoriaCusto(String codigo, String nome) {
        this.codigo = codigo;
        this.nome = nome;
        this.tipoLancamento = TipoLancamentoCusto.LIVRE;
        this.ativo = true;
    }

    public void atualizar(String nome, boolean ativo) {
        // codigo e tipo_lancamento sao IMUTAVEIS (chave estavel do app)
        this.nome = nome;
        this.ativo = ativo;
    }

    /** True para as 2 categorias seed cujo lancamento e calculado pelo sistema. */
    public boolean ehEstruturada() {
        return tipoLancamento != TipoLancamentoCusto.LIVRE;
    }

    public Integer getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public TipoLancamentoCusto getTipoLancamento() { return tipoLancamento; }
    public boolean isAtivo() { return ativo; }
}
