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
    ORDEM_SERVICO_EDITAR("Servicos", "Editar dados de uma OS nao encerrada"),
    SERVICO_EXCLUIR("Servicos", "Excluir servico ou ordem de servico"),

    CUSTO_VER("Custos", "Ver custos, markup e preco de venda"),
    CUSTO_EDITAR("Custos", "Lancar, editar e excluir custos"),

    FATURAMENTO_VER("Faturamento", "Ver cobranca e faturamento (notas fiscais) do servico"),
    FATURAMENTO_EDITAR("Faturamento", "Editar cobranca, lancar notas fiscais e fechar o faturamento"),

    RELATORIO_VER("Relatorios", "Ver relatorios de custo (por cliente e por servico)"),

    CLIENTE_VER("Cadastros", "Ver clientes (inclui contatos e unidades)"),
    CLIENTE_GERENCIAR("Cadastros", "Criar, editar e inativar clientes, contatos e unidades"),

    EQUIPAMENTO_VER("Cadastros", "Ver equipamentos"),
    EQUIPAMENTO_GERENCIAR("Cadastros", "Criar, editar e inativar equipamentos"),

    PECA_VER("Cadastros", "Ver pecas"),
    PECA_GERENCIAR("Cadastros", "Criar, editar e inativar pecas"),

    FORNECEDOR_VER("Cadastros", "Ver fornecedores"),
    FORNECEDOR_GERENCIAR("Cadastros", "Criar, editar e inativar fornecedores"),

    VEICULO_VER("Cadastros", "Ver veiculos"),
    VEICULO_GERENCIAR("Cadastros", "Criar, editar e inativar veiculos"),

    TECNICO_VER("Cadastros", "Ver tecnicos"),
    TECNICO_GERENCIAR("Cadastros", "Criar, editar e inativar tecnicos"),

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
