package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Lista configuravel pelo admin (renomear / ativar / desativar).
 * NAO permitir criacao de novos tipos via API na V1 (decisao consolidada).
 */
@Entity
@Table(name = "tipo_servico")
public class TipoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 80)
    private String nome;

    @Column(nullable = false)
    private boolean ativo = true;

    protected TipoServico() {
        // JPA
    }

    public TipoServico(String nome) {
        this.nome = nome;
        this.ativo = true;
    }

    public void atualizar(String nome, boolean ativo) {
        this.nome = nome;
        this.ativo = ativo;
    }

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public boolean isAtivo() { return ativo; }
}
