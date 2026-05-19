# 11 — Relatórios

Relatórios disponíveis na V1. Acesso restrito a **Gerente** e **Admin** (ver [10](10-matriz-permissoes.md)).

## Relatórios da V1

### 1. OS por Status
Visão operacional do andamento. Conta e lista as OS agrupadas pelo status atual.

- **Para que serve**: identificar gargalos. Se há muitas OS em `Pendente de digitação`, a equipe técnica está produzindo mais rápido do que o operador digita. Se há muitas em `Impressa`, o trabalho está acumulado em campo.
- **Filtros sugeridos**: período, cliente, técnico, tipo de serviço
- **Colunas**: código da OS (`SSSS-NNNNN`), serviço pai, cliente, técnico(s), data de abertura, data prevista (do Serviço pai), status

### 2. Custos por Serviço (com markup)
Demonstrativo financeiro por Serviço.

- **Para que serve**: ver quanto custou cada serviço e quanto seria o preço de venda
- **Filtros sugeridos**: período (data do Serviço), cliente, tipo de serviço, status
- **Colunas**:
  - Código do Serviço, cliente, descrição, status
  - Custo por categoria: mão de obra, deslocamento, peças, terceiros, hospedagem
  - **Custo total**
  - **Markup aplicado** (alíquota geral × custo total)
  - **Preço de venda** (custo total + markup)

### 3. Custos por Cliente (acumulado)
Visão consolidada por cliente.

- **Para que serve**: entender o volume gasto com cada cliente; base para futura análise de rentabilidade
- **Filtros sugeridos**: período
- **Colunas**:
  - Cliente
  - Quantidade de Serviços
  - Quantidade de OS
  - Custo total acumulado (somatório por categoria)
  - Preço de venda acumulado

## Fora do escopo (V1)

Outros relatórios discutidos mas adiados para versões futuras:

- **Técnico mais produtivo** — depende de tempo gasto por técnico, e na V1 o tempo é único por OS (não por técnico)
- **Histórico de manutenção por Equipamento** — modelo já suporta (OS aponta para equipamentos), mas a tela de relatório fica para próxima versão
- **Equipamentos por Cliente** — listagem do parque do cliente

## Princípios

- Relatórios são **somente leitura**, sem edição direta dos dados a partir deles
- Devem suportar **exportação** para Excel/CSV (formato a definir na implementação)
- Filtros padrão devem cobrir período e, quando aplicável, cliente
