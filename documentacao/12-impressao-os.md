# 12 — Impressão da OS

A OS impressa é o artefato físico entregue à equipe técnica. O técnico preenche manualmente em campo/oficina e devolve ao operador, que digita os dados no sistema.

## Layout (estrutura sugerida)

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]   Razão social / CNPJ / Endereço / Contato          │  ← Cabeçalho da empresa
├─────────────────────────────────────────────────────────────┤
│  ORDEM DE SERVIÇO         Nº: 0001-00012                    │
│  Serviço pai: 0001  ·  Tipo: Manutenção corretiva           │
│  Data de abertura: ____/____/____                           │
├─────────────────────────────────────────────────────────────┤
│  CLIENTE                                                    │
│  Nome: ___________________________________________________  │
│  Unidade: ________________________________________________  │
│  Endereço do atendimento: ________________________________  │
│  Contato local: __________________________________________  │
├─────────────────────────────────────────────────────────────┤
│  EQUIPAMENTOS ATENDIDOS                                     │
│  · Marca / Modelo / Nº de série / Localização interna       │
│  · ...                                                      │
├─────────────────────────────────────────────────────────────┤
│  ATIVIDADE PREVISTA                                         │
│  (descrição impressa pelo operador)                         │
├─────────────────────────────────────────────────────────────┤
│  EQUIPE                                                     │
│  Técnico(s): _____________________________________________  │
│  Veículo(s): _____________________________________________  │
├─────────────────────────────────────────────────────────────┤
│  EXECUÇÃO (preenchido à mão pelo técnico)                   │
│                                                             │
│  Hora início: ____:____    Hora fim: ____:____              │
│                                                             │
│  O que foi feito:                                           │
│  _________________________________________________________  │
│  _________________________________________________________  │
│  _________________________________________________________  │
│  _________________________________________________________  │
│                                                             │
│  Observações:                                               │
│  _________________________________________________________  │
│  _________________________________________________________  │
│                                                             │
│  Impedimentos:                                              │
│  _________________________________________________________  │
│  _________________________________________________________  │
├─────────────────────────────────────────────────────────────┤
│  ASSINATURAS                                                │
│                                                             │
│  ______________________    ______________________           │
│  Técnico responsável        Cliente / Responsável local     │
└─────────────────────────────────────────────────────────────┘
```

## Conteúdo confirmado

### Cabeçalho
- ✅ Logo da empresa
- ✅ Razão social, CNPJ, endereço, contato

### Identificação da OS
- ✅ Código da OS no formato `SSSS-NNNNN` (ex.: `0001-00012`), em destaque
- ✅ Referência ao Serviço pai
- ✅ Tipo de serviço (vindo do cadastro)
- ✅ Data de abertura

### Cliente e Unidade
- ✅ Nome do cliente
- ✅ Unidade (identificação interna + endereço)
- ✅ Contato local

### Equipamentos atendidos
- ✅ Lista dos equipamentos vinculados à OS
- ✅ Para cada um: marca, modelo, número de série, localização interna

### Atividade prevista
- ✅ Descrição da atividade, impressa (escrita pelo operador na abertura da OS)

### Equipe
- ✅ Técnicos envolvidos
- ✅ Veículos utilizados

### Área de preenchimento manual
- ✅ Tempo gasto (hora início / hora fim — ou período aberto)
- ✅ "O que foi feito" (linhas em branco)
- ✅ Observações
- ✅ Impedimentos

### Assinaturas
- ✅ Técnico responsável
- ✅ Cliente / responsável local

## Pendências técnicas (de implementação, não de produto)

- Formato do arquivo gerado: PDF (recomendado para impressão consistente)
- Tamanho: A4 ou meia-folha — a definir junto com o layout final
- Quantidade de vias: 1 ou 2 (uma para arquivo da empresa, outra do cliente)?
- Fonte e identidade visual: alinhar com a marca da empresa quando houver o material

## Arquivamento

Depois que o técnico devolve o papel preenchido, o operador **escaneia/fotografa** e anexa o PDF resultante à OS no sistema, junto da digitação dos campos. Esse PDF fica armazenado como o registro oficial da execução. Detalhes em [13-anexos.md](13-anexos.md).

Observação: o PDF gerado pelo sistema na hora da impressão **não é** arquivado automaticamente nesta versão — quem fecha o ciclo é o anexo do scan do papel preenchido.

## Fora do escopo (V1)

- Assinatura digital (canvas, touch) — V1 é assinatura à caneta
- QR Code de rastreio (para o cliente consultar)
- Versão da OS para o cliente (separada da via técnica)
- Arquivamento automático do PDF gerado pelo sistema na impressão (apenas o scan do papel preenchido é arquivado)
