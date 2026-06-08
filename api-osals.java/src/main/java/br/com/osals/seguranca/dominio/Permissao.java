package br.com.osals.seguranca.dominio;

/**
 * Catalogo de permissoes do sistema (autorizacao por funcao).
 *
 * O nome da constante (ex.: CUSTO_VER) e' a chave canonica: e' o que vai
 * persistido na tabela usuario_permissao, o que vira authority no Spring
 * Security (ex.: hasAuthority('CUSTO_VER')) e o que a API/UI usam para
 * identificar a permissao. {@code grupo} e {@code descricao} sao apenas
 * rotulos para a tela de administracao.
 *
 * Ver documentacao/10-matriz-permissoes.md e o plano de autorizacao (Fase 1).
 */
public enum Permissao {

    SERVICO_VER("Servicos", "Ver e listar servicos e ordens de servico"),
    SERVICO_GERENCIAR("Servicos", "Criar e editar servico e OS, encerrar, imprimir e digitar"),
    SERVICO_EXCLUIR("Servicos", "Excluir servico ou ordem de servico"),

    CUSTO_VER("Custos", "Ver custos, markup e preco de venda"),
    CUSTO_EDITAR("Custos", "Lancar, editar e excluir custos"),

    RELATORIO_VER("Relatorios", "Ver relatorios de custo (por cliente e por servico)"),

    CADASTRO_VER("Cadastros", "Ver cadastros (clientes, equipamentos, pecas, fornecedores, veiculos, tecnicos)"),
    CADASTRO_GERENCIAR("Cadastros", "Criar, editar e inativar cadastros"),

    CONFIG_GERENCIAR("Configuracao", "Configurar markup, categorias de custo, tipos de servico e unidades de medida"),

    USUARIO_GERENCIAR("Usuarios", "Gerir usuarios e suas permissoes");

    private final String grupo;
    private final String descricao;

    Permissao(String grupo, String descricao) {
        this.grupo = grupo;
        this.descricao = descricao;
    }

    public String getGrupo() {
        return grupo;
    }

    public String getDescricao() {
        return descricao;
    }
}
