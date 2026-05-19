# 16 — Plano de Implementação — Backend

Plano em fases para construção do backend Spring Boot do OS-ALS. Cada fase entrega **uma fatia que funciona** (não cascata de "fase 1 = DB, fase 2 = back, fase 3 = UI"). Cada fase tem critérios objetivos de conclusão (Definition of Done).

Stack e padrões em [09-arquitetura.md](09-arquitetura.md) e [15-padroes-backend.md](15-padroes-backend.md). Modelo em [08-modelo-de-dados.md](08-modelo-de-dados.md).

> Plano correspondente do frontend: [17-plano-frontend.md](17-plano-frontend.md).

---

## Princípios do plano

- **Fatia vertical**: cada fase entrega endpoint(s) funcional(is) + testes + atualização da `openapi.json`.
- **Teste é parte da fase**, não anexo. Sem teste, a fase não fecha (ver [15 §7](15-padroes-backend.md)).
- **Cada fase fecha com `./mvnw test` verde + build limpo**.
- **Migrations imutáveis após merge** — alterar = nova migration.
- **Snapshots de valores** em moeda (`valor_hora_centavos`, `valor_km_centavos`) protegem relatórios passados.

---

## Resumo das fases

| Fase | Tema | Esforço | Depende de |
|---|---|---|---|
| 0 | Setup do projeto e Docker | P | — |
| 1 | Autenticação e usuários | M | 0 |
| 2 | Cadastros mestres | G | 1 |
| 3 | Configurações do sistema | P | 2 |
| 4 | Serviço (CRUD + ciclo de vida) | M | 2, 3 |
| 5 | Ordem de Serviço + impressão | G | 4 |
| 6 | Custos e cálculo de preço | M | 4 |
| 7 | Anexos PDF | M | 4, 5 |
| 8 | Relatórios | M | 5, 6 |
| 9 | Hardening e CI | P | todas |

P = pequeno · M = médio · G = grande

---

## Fase 0 — Setup do projeto e Docker

### Objetivo
Subir esqueleto compilável do backend rodando em Docker, com healthcheck OK e Swagger UI acessível.

### Entregáveis

**Código**
- Projeto via `start.spring.io`: Java 17, Maven, Spring Boot 3.5.13, deps: Web, JPA, Security, Validation, PostgreSQL Driver, Flyway, Lombok? **não** (preferir records).
- Estrutura de pacotes vazia conforme [15 §2](15-padroes-backend.md):
  ```
  br.com.empresa.osals/
  ├── OsAlsApplication.java
  ├── seguranca/{dominio,aplicacao,infraestrutura,api}
  ├── cadastro/{dominio,aplicacao,infraestrutura,api}
  ├── servico/, ordemservico/, anexo/, relatorio/, impressao/
  └── compartilhado/{api,config,excecoes,util}
  ```
- `compartilhado/`:
  - `ErroResposta` (record), `PaginaResposta<T>` (record)
  - `NegocioException`, `RecursoNaoEncontradoException`, `DuplicidadeException`
  - `TratadorExcecoesGlobal` (`@RestControllerAdvice`)
  - `MoedaUtil` (centavos ↔ reais)

**Config**
- `application.yml` com placeholders das envs
- `logback-spring.xml` com `RollingFileAppender` (rotação diária, retenção 30 dias)
- `.env.example` na raiz com todas as variáveis ([09 §10](09-arquitetura.md))
- Dependência `spring-dotenv`
- Springdoc OpenAPI configurado (`/swagger-ui.html`, `/v3/api-docs`)

**Docker**
- `Dockerfile` na raiz do back (multi-stage Maven + JRE 17)
- `docker-compose.yml` na raiz do monorepo com 2 serviços: `postgres:16-alpine` + `backend`
- Volume `postgres-data`, `anexos`, `logs`
- Healthcheck do postgres + `depends_on` no backend

**Banco**
- Primeira migration `V001__habilitar_extensoes.sql` (vazia ou com `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` se for usar)

### Definition of Done
- `docker-compose up -d` sobe sem erro
- `curl http://localhost:8080/actuator/health` retorna `{"status":"UP"}`
- `http://localhost:8080/swagger-ui.html` abre
- `docker-compose logs backend` mostra logs com formato configurado
- Arquivo `logs/os-als.log` é criado no volume
- `./mvnw test` passa (sem testes ainda, mas o comando funciona)

### Riscos / atenção
- Diferenças de path entre Windows e Linux nos volumes Docker — testar no Windows real
- Healthcheck do postgres pode falhar em hardware lento — aumentar `start_period` se preciso

---

## Fase 1 — Autenticação e usuários

### Objetivo
Login funcional com JWT RS256, cookies httpOnly, refresh token, e endpoint `GET /auth/eu` retornando usuário atual.

### Entregáveis

**Migrations**
- `V002__criar_tabela_usuario.sql` — id, nome, email único, senha_hash, papel, ativo, versao_token, created_at
- `V003__criar_tabela_tecnico.sql` — usuario_id PK/FK, valor_hora_centavos, especialidade, telefone
- `V004__criar_tabela_token_refresh.sql` — id, usuario_id, token_hash, expira_em, revogado_em, created_at

**Domínio**
- Entidades JPA: `Usuario`, `Tecnico`, `TokenRefresh`
- Enum `Papel` (`OPERADOR`, `GERENTE`, `ADMIN`, `TECNICO`)
- Repositórios

**Aplicação**
- `ServicoAutenticacao`: login, refresh, logout
- `ServicoUsuarios`: criar (admin), desativar, alterar senha
- DTOs: `LoginRequisicao`, `TokenResposta`, `UsuarioResumoDto`, `CriacaoUsuarioRequisicao`
- `MapperUsuario`

**Infraestrutura**
- `GeradorJwt` + `ValidadorJwt` usando JJWT 0.12.6 (RS256)
- `FiltroAutenticacaoJwt` (lê cookie/header, popula `SecurityContext`)
- `SegurancaConfig` (filtros, BCrypt, rotas públicas)
- `ConfiguracoesJwt` (`@ConfigurationProperties` + `@Validated`)

**API**
- `POST /auth/login` (email + senha → tokens em cookie httpOnly + body com `UsuarioResumoDto`)
- `POST /auth/refresh` (refresh em cookie → novo par de tokens, revoga o anterior)
- `POST /auth/logout` (revoga refresh + limpa cookies)
- `GET /auth/eu` (retorna usuário do token)
- `POST /usuarios` (admin cria usuário)
- `PATCH /usuarios/{id}/ativar` / `desativar`

**Bootstrap**
- Componente `BootstrapAdmin` que, ao subir o app, cria admin inicial se a tabela `usuario` estiver vazia, usando `BOOTSTRAP_ADMIN_EMAIL` / `_SENHA` / `_NOME`

**Testes**
- Unitário: `ServicoAutenticacaoTest` (login OK, senha errada, usuário inativo, token revogado)
- Integração: `ControladorAutenticacaoIT` com Testcontainers (fluxo completo login → eu → refresh → logout)
- Multi-cobertura: 80% de `ServicoAutenticacao`

### Definition of Done
- `POST /auth/login` com Postman retorna 200 + cookies + `UsuarioResumoDto`
- `GET /auth/eu` com cookie retorna dados; sem cookie retorna 401
- `POST /auth/refresh` rotaciona token e revoga o anterior (reuso = 401)
- Admin inicial criado a partir das envs
- Testes passam, cobertura `ServicoAutenticacao` ≥ 80%
- `openapi.json` regenerado e commitado

### Riscos / atenção
- Chaves PEM (RS256) precisam ser geradas: `openssl genrsa -out chave-privada.pem 2048` + `openssl rsa -pubout`. Documentar no README como gerar.
- Cookies `httpOnly`/`secure`/`sameSite=lax` — testar em HTTP local (`secure=false` em dev) e HTTPS prod

---

## Fase 2 — Cadastros mestres

### Objetivo
CRUD completo de todas as entidades de domínio que não dependem de Serviço/OS.

### Entregáveis

**Migrations** (uma por tabela)
- `V005__criar_tabela_cliente.sql`
- `V006__criar_tabela_contato_cliente.sql`
- `V007__criar_tabela_unidade.sql`
- `V008__criar_tabela_equipamento.sql`
- `V009__criar_tabela_veiculo.sql`
- `V010__criar_tabela_unidade_medida.sql` (+ seeds)
- `V011__criar_tabela_peca.sql`
- `V012__criar_tabela_fornecedor.sql`
- `V013__criar_tabela_tipo_servico.sql` (+ seeds: 5 tipos)
- `V014__criar_tabela_categoria_custo.sql` (+ seeds: 5 categorias)

**Módulo `cadastro/`**
- Pra cada entidade: entidade JPA, repositório, service, controller, mapper, DTOs (Requisicao/Resposta/Resumo), testes
- Validações Bean Validation (`@NotBlank`, `@Email`, `@CPF`, `@CNPJ`, `@Size`)
- Soft delete (`ativo=false`)
- Paginação em todas as listagens
- Busca textual onde fizer sentido (cliente.nome, equipamento.numero_serie)

**Endpoints**

```
GET    /clientes (paginado, ?busca=)
GET    /clientes/{id}
POST   /clientes
PUT    /clientes/{id}
DELETE /clientes/{id} (soft)

GET    /clientes/{id}/unidades
POST   /clientes/{id}/unidades
PUT    /unidades/{id}
DELETE /unidades/{id}

GET    /unidades/{id}/equipamentos
POST   /unidades/{id}/equipamentos
PUT    /equipamentos/{id}
DELETE /equipamentos/{id}

[mesma família para veículos, peças, fornecedores, técnicos]
```

**Permissões** (`@PreAuthorize`)
- Listar/buscar/criar/editar: qualquer usuário autenticado
- Excluir (soft): gerente ou admin

### Definition of Done
- Cada entidade tem suite mínima de testes (criar OK, criar inválido = 400, atualizar OK, listar paginado, soft delete)
- Cobertura ≥ 80% em todos os services
- Seeds de `tipo_servico` e `categoria_custo` rodaram (5 + 5 registros)
- `openapi.json` atualizada

### Riscos / atenção
- **Fase mais longa em volume**. Estimar carinhosamente. Pode ser dividida em sub-fases (`2a — cliente/unidade/equipamento`, `2b — técnico/veículo`, `2c — peças/fornecedores`).
- Validação de CPF/CNPJ — usar lib (`br.com.caelum.stella` ou implementar). Validação no backend é a real.
- `unidade.cep` vs ViaCEP — backend só armazena; lookup é client-side ([09 §11.6 do salesys](09-arquitetura.md) — não aplicável aqui, mas mesmo princípio)

---

## Fase 3 — Configurações do sistema

### Objetivo
Admin pode configurar markup geral, valor/km de deslocamento, e ativar/desativar/renomear listas (tipos de serviço, categorias de custo).

### Entregáveis

**Migrations**
- `V015__criar_tabela_configuracao.sql` + seeds `markup_percentual=30.00`, `valor_km_centavos=150`

**Módulo `configuracao/`** (dentro de `compartilhado/` ou módulo próprio)
- Entidade `Configuracao` (chave-valor)
- `ServicoConfiguracao`: getter tipado por chave (`buscarLong("valor_km_centavos")`)
- Cache em memória com TTL curto (ou refresh on demand)

**Endpoints**
```
GET    /configuracoes (admin)            → lista todas
GET    /configuracoes/{chave} (admin)
PUT    /configuracoes/{chave} (admin)    → valida tipo

PATCH  /tipos-servico/{id} (admin)       → renomear/ativar/desativar
PATCH  /categorias-custo/{id} (admin)    → idem (sem POST — seeds fixos)
```

### Definition of Done
- Admin altera markup via API, novos cálculos refletem
- Admin desativa um tipo de serviço, listagem só mostra ativos
- Tentativa de criar categoria nova retorna 405 ou 403
- Tests

---

## Fase 4 — Serviço (CRUD + ciclo de vida)

### Objetivo
Cadastrar Serviço, listar, editar enquanto não-concluído, finalizar, cancelar.

### Entregáveis

**Migrations**
- `V016__criar_tabela_servico.sql` + `CREATE SEQUENCE servico_numero_seq`

**Módulo `servico/`**
- Entidade `Servico`, enum `StatusServico`
- Métodos da entidade: `podeEditar()`, `podeFinalizar()`, `estaEncerrado()`
- `ServicoServico` (não confundir nomenclatura — pode ser `GestorServicos` ou similar)
- Validação de transições no service (não no controller)

**Endpoints**
```
GET    /servicos (paginado, filtros: status, cliente, tipo, periodo)
GET    /servicos/{id}
POST   /servicos
PUT    /servicos/{id}                  → só se não Concluído/Cancelado
POST   /servicos/{id}/finalizar        → status → CONCLUIDO
POST   /servicos/{id}/cancelar         → status → CANCELADO
```

**Geração do número**: ao criar, `nextval('servico_numero_seq')` via JPA `@SequenceGenerator`.

**Testes**
- Transições válidas e inválidas (não reabrir Concluído, não cancelar Concluído)
- Numeração sequencial e única
- Permissões (operador edita; gerente/admin sempre)

### Definition of Done
- Criar Serviço retorna `numero` formatado (`0001`)
- Editar Serviço Concluído → 422
- Suite de testes cobre todas as transições

---

## Fase 5 — Ordem de Serviço + impressão

### Objetivo
Abrir OS dentro de um Serviço, listar OS de um serviço, gerar PDF da OS impressa, digitar dados da execução.

### Entregáveis

**Migrations**
- `V017__criar_tabela_ordem_servico.sql` + sequence
- `V018__criar_tabela_os_tecnico.sql`
- `V019__criar_tabela_os_veiculo.sql`
- `V020__criar_tabela_os_equipamento.sql`

**Módulo `ordemservico/`**
- Entidade `OrdemServico`, enum `StatusOrdemServico`
- Relações N:N com Tecnico, Veiculo, Equipamento
- Métodos: `imprimir()` (atualiza status + `data_impressao`), `digitarExecucao()`, `concluir()`, `cancelar()`

**Módulo `impressao/`**
- Dep OpenHTMLtoPDF + Thymeleaf
- Template `os-impressa.html` (Thymeleaf) com layout do [12](12-impressao-os.md)
- `GeradorPdfOS`: carrega OS+Serviço+Cliente+Unidade+Equipamentos+Técnicos+Veículos, renderiza, retorna `byte[]`

**Endpoints**
```
POST   /servicos/{id}/ordens-servico       → abrir OS
GET    /ordens-servico (paginado, filtros)
GET    /ordens-servico/{id}
POST   /ordens-servico/{id}/imprimir       → retorna application/pdf
POST   /ordens-servico/{id}/digitar-execucao → preenche o que foi feito, tempo, etc.
POST   /ordens-servico/{id}/cancelar
```

**Validações**
- Servico pai não pode estar Concluído/Cancelado
- 1..N técnicos obrigatórios
- 1..N equipamentos obrigatórios (vinculados a alguma unidade do cliente do serviço)
- Veículos opcionais

**Testes**
- Fluxo completo: abrir → imprimir → digitar → concluir
- Transições inválidas
- PDF gerado tem tamanho > 0 e content-type correto

### Definition of Done
- PDF da OS abre corretamente em leitor de PDF
- Layout bate com [12](12-impressao-os.md): cabeçalho, código, cliente, unidade, equipamentos, área de preenchimento, assinaturas
- Status da OS muda corretamente ao imprimir e ao digitar

### Riscos / atenção
- Layout do PDF pode demandar iteração visual. Bom tê-lo conectado ao front cedo pra ver o resultado real.
- Codificação UTF-8 / acentos no PDF — testar com nomes longos e caracteres especiais

---

## Fase 6 — Custos e cálculo de preço

### Objetivo
Lançar custos no Serviço em 5 categorias (com 2 estruturadas, 3 livres), calcular preço de venda com markup.

### Entregáveis

**Migrations**
- `V021__criar_tabela_lancamento_custo.sql`

**Módulo `servico/` (extensão)**
- Entidade `LancamentoCusto`
- `ServicoLancamentoCusto`:
  - `lancar(servicoId, requisicao)` — valida por categoria
  - `editar(id, requisicao)` — respeita regra "operador não edita pós-Concluído"
  - `excluir(id)` — idem
  - `calcularResumoFinanceiro(servicoId)` — agregação por categoria + total + markup + preço
- Snapshot: ao lançar mão de obra, copiar `valor_hora_centavos` do técnico; ao lançar deslocamento, copiar `valor_km_centavos` da configuração

**DTOs**
- `LancamentoCustoRequisicao` (campos opcionais por categoria)
- `LancamentoCustoResposta`
- `ResumoFinanceiroServico` (custo por categoria, custo total, markup aplicado, preço venda)

**Endpoints**
```
GET    /servicos/{id}/custos              → lista lançamentos
POST   /servicos/{id}/custos              → lança
PUT    /servicos/{id}/custos/{custoId}    → edita (com regra de status)
DELETE /servicos/{id}/custos/{custoId}    → exclui (com regra de status)
GET    /servicos/{id}/resumo-financeiro   → custo + markup + preço de venda
```

**Permissões**
- Lançar/editar/excluir enquanto Servico **não** Concluído: operador, gerente, admin
- Editar/excluir após Concluído: só gerente e admin
- Operador recebe 403 se tentar mexer pós-Concluído

**Testes**
- Lançamento de cada categoria com validações específicas
- Snapshot funcionando (alterar `valor_hora` do técnico não muda lançamentos antigos)
- Cálculo do preço de venda (custo × (1 + markup/100))
- Regras de status pós-Concluído

### Definition of Done
- Lançar mão de obra estruturada cobra `tecnico_id`, `horas`, calcula `valor_total_centavos`
- Custo total e preço de venda calculados corretamente em cents
- Operador tentando editar pós-Concluído → 403

---

## Fase 7 — Anexos PDF

### Objetivo
Upload de PDFs no Serviço (múltiplos) e na OS (1 fixo). Download protegido.

### Entregáveis

**Migrations**
- `V022__criar_tabela_anexo_servico.sql`
- `V023__criar_tabela_anexo_os.sql`

**Módulo `anexo/`**
- Interface `StorageGateway` (`armazenar(bytes, key) → key`, `recuperar(key) → InputStream`, `remover(key)`)
- Implementação `StorageGatewayLocal` (filesystem, `ANEXOS_DIR`)
- `ServicoAnexo`: orquestra validação + storage + persistência de metadados
- Validação:
  - Content-type === `application/pdf`
  - Primeiros bytes === `%PDF-` (magic bytes)
  - Tamanho ≤ `ANEXO_TAMANHO_MAX_MB` (default 10 MB)

**Endpoints**
```
POST   /servicos/{id}/anexos              → multipart/form-data, retorna metadados
GET    /servicos/{id}/anexos              → lista
GET    /anexos-servico/{id}/conteudo      → stream application/pdf (Content-Disposition: inline)
DELETE /servicos/{id}/anexos/{anexoId}    → respeita regra de status

POST   /ordens-servico/{id}/anexo         → upload único, substitui
GET    /ordens-servico/{id}/anexo         → metadados
GET    /ordens-servico/{id}/anexo/conteudo → stream
DELETE /ordens-servico/{id}/anexo         → respeita regra de status
```

**Permissões**
- Upload/listagem/download: qualquer autenticado
- Remover/substituir após status Concluído: gerente/admin

**Testes**
- Upload válido OK
- Upload de não-PDF (renomeado) → 400 (magic bytes)
- Upload > 10MB → 413
- Download verifica autorização

### Definition of Done
- Arquivo persiste no volume Docker entre reinicializações
- Substituir anexo da OS apaga o anterior do filesystem
- Stream funciona inline no browser

### Riscos / atenção
- Permissão de escrita no volume Docker em Windows — testar
- Streaming de arquivos grandes — usar `StreamingResponseBody` ou `ResponseEntity<Resource>`

---

## Fase 8 — Relatórios

### Objetivo
3 endpoints agregados conforme [11](11-relatorios.md).

### Entregáveis

**Módulo `relatorio/`**
- DTOs específicos: `OSPorStatusRelatorio`, `CustosPorServicoRelatorio`, `CustosPorClienteRelatorio`
- Queries customizadas (JPQL) com agregação por categoria
- Paginação e filtros (período, cliente, tipo de serviço)

**Endpoints**
```
GET /relatorios/os-por-status?inicio=&fim=&clienteId=&tecnicoId=
GET /relatorios/custos-por-servico?inicio=&fim=&clienteId=&tipoServicoId=&status=
GET /relatorios/custos-por-cliente?inicio=&fim=
```

**Permissões**
- Todos: gerente, admin (operador não vê relatórios — ver [10](10-matriz-permissoes.md))

**Testes**
- Seeds amplos (vários serviços com várias categorias)
- Verificar agregações por categoria, total e preço de venda

### Definition of Done
- Filtros funcionam, paginação correta
- Cálculo bate com cálculo do `ServicoLancamentoCusto.calcularResumoFinanceiro`
- 403 para operador

---

## Fase 9 — Hardening e CI

### Objetivo
Endurecer pra entrega: CI passa, build verde, OpenAPI versionado, README atualizado, smoke test do compose.

### Entregáveis

**CI** (GitHub Actions ou equivalente)
- `.github/workflows/back.yml`:
  - `./mvnw test` em PRs
  - `./mvnw package` em PRs
  - `./mvnw jacoco:report` + verificar cobertura mínima

**Validação de startup**
- `@ConfigurationProperties` + `@Validated` para todos os blocos `app.*`
- App falha rápido se faltar variável obrigatória

**CORS final**
- Origens, métodos, headers conforme `.env`

**README**
- Como gerar chaves JWT
- Como rodar `docker-compose up -d`
- Como acessar Swagger UI
- Como criar admin inicial via `.env`

**OpenAPI**
- Regenerar `documentos/postman/openapi.json` final
- Anotar todos os controllers com `@Operation` + `@ApiResponses`

**Smoke test**
- Script `scripts/smoke.sh` que sobe o compose, espera healthcheck, faz login com admin bootstrap, lista clientes, finaliza

**Logs**
- Verificar que `logs/os-als.log` tem entradas significativas (login, criação de Serviço, abertura de OS)
- Confirmar rotação (mudando data do sistema ou aguardando)

### Definition of Done
- CI verde em main
- Smoke test passa
- README cobre setup local em < 5 minutos para um dev novo

---

## Ordem de dependências (resumo)

```
0 → 1 → 2 → 3 → 4 → 5
                  ↘
                   6 → 8
                   7

4 + 6 + 7 + 5 → 9
```

Fase 6 e Fase 7 podem ser paralelizadas se houver mais de uma pessoa (dependem só de 4).

---

## Riscos transversais

| Risco | Mitigação |
|---|---|
| Acúmulo de dívida de testes | Fechar fase só com cobertura ≥ 80% nos services |
| Migrations alteradas em retrospecto | Code review obrigatório; checksum mismatch trava boot |
| PDF da OS atrasar fase 5 | Começar template Thymeleaf desde cedo, mesmo simplificado |
| Volume Docker no Windows | Testar caminho com espaços; usar named volumes (não bind mounts diretos) |
| Permissões `@PreAuthorize` esquecidas | Checklist do [15 §12](15-padroes-backend.md) em todo PR |
| Snapshots de valor não funcionando | Test dedicado: alterar valor_hora do técnico após lançar custo e verificar relatório |
