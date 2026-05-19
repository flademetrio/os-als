# 06 — Custos

## Princípios gerais

- ✅ **Lançamento manual** dos custos pelo operador (não é cálculo automático a partir das OS)
- ✅ Os custos são lançados **no nível do Serviço** (não na OS individualmente)
- ✅ O sistema **trabalha com markup**: `preço de venda = custo total + markup`
- ✅ **Markup é geral, configurado pelo admin** — uma única alíquota percentual aplicada sobre o custo total. Não há markup por categoria nem por serviço
- ✅ **Custos independem da existência de OS** — o operador pode lançar custos no Serviço assim que ele é cadastrado, sem precisar ter aberto uma OS

## Categorias de custo

| Categoria | Tipo de lançamento | Como funciona |
|---|---|---|
| **Mão de obra** | Estruturado | `técnico × horas × valor/hora`. O sistema calcula. Implica que o cadastro de Técnico tem campo `valor/hora` |
| **Deslocamento** | Estruturado | `km × valor/km`. O sistema calcula. O valor/km é configuração geral |
| **Peças e materiais** | Livre | Descrição + valor. Não puxa do cadastro de peças (o cadastro é apenas catálogo de referência) |
| **Terceiros** | Livre | Descrição + valor. Não puxa do cadastro de fornecedores |
| **Hospedagem / alimentação em obra** | Livre | Descrição + valor |

## Edição e exclusão

| Estado do Serviço | Operador | Gerente / Admin |
|---|---|---|
| Em aberto / Em execução / Aguardando | ✅ Pode editar e excluir | ✅ Pode editar e excluir |
| **Concluído / Cancelado** | ❌ Não pode | ✅ Pode editar e excluir (com responsabilidade) |

Recomendação: registrar log de auditoria das alterações de custo em Serviço Concluído (quem alterou, quando, valor anterior/novo). _Detalhe técnico — não é decisão de produto._

## Cálculo do preço de venda

Valores armazenados e calculados em **centavos** (inteiros), conforme [09-arquitetura.md §8](09-arquitetura.md). Conversão para reais (`R$ 299,90`) é só na UI.

```
custo_mao_de_obra_centavos   = Σ (técnico_i.valor_hora_centavos × horas_i)
custo_deslocamento_centavos  = km_total × valor_km_centavos_configurado
custo_pecas_centavos         = Σ (lançamentos livres de peças, em centavos)
custo_terceiros_centavos     = Σ (lançamentos livres de terceiros, em centavos)
custo_hospedagem_centavos    = Σ (lançamentos livres de hospedagem, em centavos)

custo_total_centavos         = soma das 5 categorias
preço_venda_centavos         = custo_total_centavos × (1 + markup_geral / 100)
```

## Fora do escopo (V1)

- **Anexar comprovante** ao custo (NF, recibo) — depende de suporte a anexos, que está fora do escopo
- **Markup por categoria** ou **markup por serviço** — não nesta versão
- **Faturamento** do preço de venda calculado — sistema apenas exibe o valor; a cobrança em si é externa (ver [07](07-fora-de-escopo-v1.md))
