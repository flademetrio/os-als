# 04 — Fluxo Principal: Serviço e OS

## Modelo conceitual

```
Cliente
   └── Unidade
         └── Equipamento(s)

Cliente
   └── Serviço (unidade contratual/operacional)
         ├── Descrição
         ├── Prazos
         ├── Cronograma (datas previstas de início/fim — só no Serviço)
         ├── Custos (lançamentos manuais por categoria)
         ├── Anexos (múltiplos PDFs — orçamento, contrato, projeto, etc.)
         └── OS 1..N (atividades operacionais)
               ├── Técnicos envolvidos (1..N)
               ├── Veículos (1..N)
               ├── Descrição da atividade
               ├── Equipamento(s) atendido(s) (1..N — referência aos equipamentos do cliente)
               ├── Preenchido no papel, digitado depois pelo operador:
               │     - O que foi feito
               │     - Período/tempo gasto (único, não por técnico)
               │     - Observações
               │     - Impedimentos
               ├── Anexo (1 PDF — scan da OS preenchida)
               └── Status
```

## Regras de negócio confirmadas

- ✅ **OS sempre tem Serviço pai** — não existe OS avulsa
- ✅ **OS de campo e OS de oficina seguem o mesmo fluxo** — sem diferença de estados ou campos
- ✅ **Cronograma é simples** — datas previstas de início e fim, **só no nível do Serviço** (a OS não tem cronograma próprio)
- ✅ **Tempo de execução é único por OS** — não é registrado por técnico individualmente
- ✅ **Múltiplos técnicos numa OS = um preenchimento único** representando o trabalho de todos
- ✅ **Múltiplos veículos por OS** — uma OS pode ter um ou mais veículos associados
- ✅ **OS aponta para 1..N equipamentos** do cliente, alimentando o histórico de manutenção por equipamento
- ✅ **Múltiplas atividades = múltiplas OS** — se o serviço tem 2 atividades, abre 2 OS, mesmo que envolvam os mesmos técnicos
- ✅ **OS/Serviço finalizados não podem ser reabertos**

## Status

### Status do Serviço
`Em aberto` → `Em execução` → `Aguardando` → `Concluído`
Encerramento alternativo: `Cancelado`

### Status da OS
`Aberta` → `Impressa` → `Pendente de digitação` → `Concluída`
Encerramento alternativo: `Cancelada`

## Ciclo de vida

1. **Cadastro do Serviço** — operador cadastra serviço vinculado ao cliente (descrição, prazos, cronograma)
2. **Abertura da OS** — para cada atividade prevista, operador abre uma OS informando técnicos envolvidos, veículos, descrição, e os equipamentos atendidos
3. **Impressão** — OS é impressa e entregue à equipe técnica → status passa a `Impressa`
4. **Execução** — equipe executa em campo/oficina, preenchendo manualmente o papel (tempo, o que foi feito, observações, impedimentos)
5. **Devolução** — equipe devolve a OS preenchida ao operador → status passa a `Pendente de digitação`
6. **Digitação** — operador lança no sistema os dados preenchidos pela equipe e **anexa o PDF do scan/foto da OS preenchida** (ver [13](13-anexos.md)) → status passa a `Concluída`
7. Ciclo se repete (passos 2-6) até todas as atividades estarem encerradas
8. **Finalização do Serviço** — após finalização, não pode ser reaberto

## Numeração

### Serviço
Sequencial **global**, 4 dígitos com zero à esquerda: `0001`, `0002`, ..., `9999`.

### OS
Sequencial **global** no sistema (independente do Serviço pai), 5 dígitos com zero à esquerda: `00001`, `00002`, ..., `99999`.

### Código de exibição da OS
Formato `SSSS-NNNNN`, concatenando Serviço pai e número global da OS:

```
Exemplo: 0001-00012
         └┬─┘ └─┬─┘
          │    └── número global da OS no sistema
          └─────── número do Serviço pai
```

> Como o número da OS é **global**, dentro de um mesmo Serviço as OS podem ter números **não contíguos** (ex.: Serviço `0001` pode conter OS `00012`, `00045`, `00078`, conforme outras OS foram abertas no sistema entre elas).
