# 05 — Perguntas em Aberto

> ✅ **Todas as pendências iniciais foram resolvidas.** As decisões foram aplicadas nos documentos correspondentes (00–07, 10–12).

Use este documento para registrar **novas dúvidas** que aparecerem durante o desenvolvimento ou em rodadas futuras com o PO.

## Como usar
1. Anote a dúvida abaixo, em forma de pergunta clara, agrupando por tema.
2. Quando a decisão for tomada, mova a regra para o documento correspondente (ex.: custos → [06](06-custos.md), permissões → [10](10-matriz-permissoes.md), etc.) e remova a entrada daqui.

## Pendências atuais
_(nenhuma no momento)_

---

## Histórico — pendências resolvidas

Sumário do que foi decidido e onde está documentado:

| Pendência | Decisão | Documento |
|---|---|---|
| Nomenclatura: "operador" ou "atendente"? | **Operador** | [02](02-atores.md) |
| PMOC / contratos recorrentes | Sem entidade dedicada; cada visita vira um Serviço comum | [03](03-cadastros.md), [07](07-fora-de-escopo-v1.md) |
| Numeração da OS | `SSSS-NNNNN` — Serviço 4 díg. + OS global 5 díg. | [04](04-fluxo-servico-os.md) |
| Status do Serviço | Em aberto → Em execução → Aguardando → Concluído / Cancelado | [04](04-fluxo-servico-os.md) |
| Status da OS | Aberta → Impressa → Pendente de digitação → Concluída / Cancelada | [04](04-fluxo-servico-os.md) |
| Tipos de Serviço | Instalação, Manut. preventiva, Manut. corretiva, Higienização/limpeza, Montagem | [03](03-cadastros.md) |
| Técnico tem valor/hora? | Sim (decorrência da mão de obra estruturada) | [03](03-cadastros.md), [06](06-custos.md) |
| OS ↔ Equipamento | 1..N equipamentos por OS | [04](04-fluxo-servico-os.md) |
| Cronograma onde? | Só no Serviço | [04](04-fluxo-servico-os.md) |
| Múltiplos veículos por OS? | Sim, 1..N | [04](04-fluxo-servico-os.md) |
| Custos no Serviço ou na OS? | Só no Serviço | [06](06-custos.md) |
| Mão de obra: detalhamento | Estruturada (técnico × horas × valor/hora) | [06](06-custos.md) |
| Deslocamento: detalhamento | Estruturado (km × valor/km) | [06](06-custos.md) |
| Peças: detalhamento | Lançamento livre (não puxa do cadastro) | [06](06-custos.md) |
| Terceiros: detalhamento | Lançamento livre (não puxa do cadastro) | [06](06-custos.md) |
| Markup: como aplica? | Geral, uma configuração do sistema | [06](06-custos.md) |
| Custo antes da OS existir? | Sim, custo independe de OS | [06](06-custos.md) |
| Edição/exclusão de custos | Operador trava após Concluído; gerente/admin liberam | [02](02-atores.md), [06](06-custos.md) |
| Matriz de permissões | Definida (operador, gerente, admin) | [02](02-atores.md), [10](10-matriz-permissoes.md) |
| Relatórios do Dia 1 | OS por status, Custos por Serviço, Custos por Cliente | [11](11-relatorios.md) |
| Layout da OS impressa | Cabeçalho completo + dados cliente + equipamentos + áreas de preenchimento + assinaturas | [12](12-impressao-os.md) |
| Anexos no Serviço | Múltiplos PDFs, sem categoria fixa | [13](13-anexos.md) |
| Anexo na OS | 1 PDF — scan do papel preenchido pelo técnico, anexado pelo operador na digitação | [13](13-anexos.md), [04](04-fluxo-servico-os.md) |
| Formatos de anexo aceitos | Apenas PDF | [13](13-anexos.md) |
| Admin cria novas categorias de custo? | Não — apenas as 5 seeds (renomear/desativar OK) | [08](08-modelo-de-dados.md) |
| Log de auditoria de alterações de custo? | Fora da V1 | [07](07-fora-de-escopo-v1.md), [08](08-modelo-de-dados.md) |
| Equipamento.status — manual ou derivado? | Manual (operador edita) | [08](08-modelo-de-dados.md) |
| Storage dos anexos | Pasta local na V1; object storage em produção | [13](13-anexos.md) |
| Tamanho máximo do PDF | 10 MB | [13](13-anexos.md) |
