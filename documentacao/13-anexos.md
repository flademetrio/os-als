# 13 — Anexos (PDFs)

O sistema permite anexar arquivos **PDF** em dois pontos: no **Serviço** e na **OS**. Servem para preservar documentos físicos relacionados ao trabalho.

## Onde se aplica

### Anexos no Serviço
- **Espaço genérico, múltiplos arquivos**, sem categoria fixa
- Operador pode anexar quantos PDFs forem necessários (orçamento, contrato, projeto, foto-relatório do cliente, e-mail, NF, etc.) — não há tipos pré-definidos
- Cada arquivo tem: nome de arquivo, descrição opcional, data/hora do upload, usuário que enviou

### Anexo na OS
- **Um PDF por OS**: o **scan/foto da OS preenchida pelo técnico**
- É anexado pelo operador no momento da **digitação** (após receber o papel de volta), junto com os campos digitados
- Substitui a versão anterior se for reanexado (mantém um único arquivo "oficial" da OS preenchida)

## Formato aceito

**Apenas `.pdf`.**

- Imagens (JPG, PNG) **não são aceitas** diretamente — o operador deve converter (escanear como PDF, ou unir fotos em PDF) antes de anexar
- Outros formatos (doc, xls, etc.) também não são aceitos

## Regras de manipulação

| Ação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Anexar PDF ao Serviço | ✅ | ✅ | ✅ |
| Anexar PDF à OS (scan da OS preenchida) | ✅ | ✅ | ✅ |
| Baixar/visualizar anexos | ✅ | ✅ | ✅ |
| Remover anexo do Serviço enquanto **não Concluído** | ✅ | ✅ | ✅ |
| Remover anexo do Serviço **após Concluído** | ❌ | ✅ | ✅ |
| Substituir/remover anexo da OS enquanto **não Concluída** | ✅ | ✅ | ✅ |
| Substituir/remover anexo da OS **após Concluída** | ❌ | ✅ | ✅ |

Os critérios espelham as regras de edição de custos (operador trava após conclusão; gerente/admin liberam).

## Armazenamento

- **V1**: **pasta local no servidor** (filesystem). Caminho/raiz configurável via variável de ambiente (ex.: `ANEXOS_DIR=/var/os-als/anexos`). Os arquivos físicos ficam ali; a tabela `anexo_servico` / `anexo_os` guarda apenas a chave/caminho relativo.
- **Produção futura**: migrar para object storage externo (S3, Cloudflare R2, Supabase Storage, MinIO). O schema do banco **não muda** (a coluna `storage_key` continua sendo um identificador opaco) — muda só a integração no app.

## Limites

- **Tamanho máximo por arquivo**: **10 MB** (`10 * 1024 * 1024` bytes). O app rejeita uploads maiores com mensagem clara
- **Formato aceito**: apenas `application/pdf` (validação por content-type **e** assinatura mágica do PDF para evitar arquivos renomeados)
- **Quantidade de anexos por Serviço**: sem limite rígido nesta versão

## Pendências técnicas (de implementação)

A definir durante o desenvolvimento (não afetam decisões de produto):

- **Antivírus / validação adicional** do conteúdo do PDF
- **Pré-visualização inline** (PDF.js) vs apenas download
- **Backup** da pasta local (estratégia + retenção)

## Fora do escopo (V1)

- **Anexos com formato diferente de PDF** (imagens diretas, planilhas, etc.)
- **Anexar comprovantes** a lançamentos de custo individualmente (NF, recibo por categoria de custo) — continua fora; só Serviço e OS têm anexos
- **Fotos antes/depois** capturadas pelo técnico em campo (depende da operação digital do técnico, fora da V1)
- **Versionamento** de anexos (manter histórico de versões substituídas) — apenas a versão atual é guardada
