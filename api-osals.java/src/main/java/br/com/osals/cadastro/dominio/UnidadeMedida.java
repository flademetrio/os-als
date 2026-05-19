package br.com.osals.cadastro.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "unidade_medida")
public class UnidadeMedida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 8)
    private String sigla;

    @Column(nullable = false, length = 40)
    private String nome;

    protected UnidadeMedida() {
        // JPA
    }

    public UnidadeMedida(String sigla, String nome) {
        this.sigla = sigla;
        this.nome = nome;
    }

    public void atualizar(String sigla, String nome) {
        this.sigla = sigla;
        this.nome = nome;
    }

    public Integer getId() { return id; }
    public String getSigla() { return sigla; }
    public String getNome() { return nome; }
}
