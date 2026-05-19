# 02 — Atores e Papéis

## Perfis definidos

O sistema tem **separação de papéis** com três perfis de usuário interno + o técnico:

### Operador
- Cadastra clientes, unidades, equipamentos
- Cadastra serviços (vinculados ao cliente)
- Abre OS dentro de cada serviço
- Imprime OS e entrega à equipe técnica
- Recebe a OS preenchida em papel e digita as informações no sistema
- Lança custos do serviço
- Acompanha andamento até a finalização
- **Não vê relatórios**
- **Não edita/exclui custos após o Serviço estar Concluído**

### Gerente
- Tudo que o operador faz
- **Vê relatórios** (operacionais, custos, equipamentos)
- **Pode editar/excluir custos** mesmo após o Serviço estar Concluído

### Administrador
- Tudo que o gerente faz
- **Cadastra usuários e papéis**
- **Configura o sistema**: markup geral, status, tipos de serviço, categorias de custo

### Técnico
- **Tem login no sistema**, mas **opera via papel nesta primeira versão**
- Recebe a OS impressa
- Preenche manualmente: o que foi feito, tempo gasto, observações, impedimentos
- Devolve para o operador
- Tem cadastro de **valor/hora**, usado no cálculo da mão de obra

> **Por que o técnico tem login mesmo trabalhando no papel?**
> Para deixar caminho aberto para migração futura ao preenchimento digital sem refazer o modelo de usuários. E permite outros usos pontuais (ex.: técnico consultar o histórico de manutenção do equipamento antes de ir ao cliente).

## Matriz de permissões resumida

| Operação | Operador | Gerente | Admin |
|---|---|---|---|
| Cadastros (cliente, unidade, equipamento, técnico, veículo, peças, fornecedores) | ✅ | ✅ | ✅ |
| Cadastrar/editar Serviço, abrir/imprimir OS, digitar execução | ✅ | ✅ | ✅ |
| Finalizar Serviço | ✅ | ✅ | ✅ |
| Lançar custos | ✅ | ✅ | ✅ |
| **Editar/excluir custo após Serviço Concluído** | ❌ | ✅ | ✅ |
| Anexar PDFs ao Serviço e à OS | ✅ | ✅ | ✅ |
| **Remover/substituir anexo após Concluído** | ❌ | ✅ | ✅ |
| **Ver relatórios** | ❌ | ✅ | ✅ |
| **Cadastrar usuários e papéis** | ❌ | ❌ | ✅ |
| **Configurar sistema** (markup, status, tipos, categorias) | ❌ | ❌ | ✅ |

Matriz detalhada por operação fica em [10-matriz-permissoes.md](10-matriz-permissoes.md).

## Fora do escopo (V1)
- **Perfil financeiro separado** — cobrança/contrato fora de escopo neste momento
- **Portal do cliente final** — sem acesso para clientes nesta versão
