# 17 — Plano de Implementação — Frontend

Plano em fases para construção do frontend Next.js do OS-ALS. As fases **se sincronizam com o backend** ([16-plano-backend.md](16-plano-backend.md)) — cada fase do front consome endpoints da fase correspondente do back.

Stack e padrões em [09-arquitetura.md](09-arquitetura.md) e [14-ui-padroes.md](14-ui-padroes.md).

---

## Princípios do plano

- **Fatia vertical**: cada fase entrega tela(s) usável(eis) end-to-end.
- **Sem testes na V1** (ver [14 §10](14-ui-padroes.md)). A rede de segurança é `npx tsc --noEmit` + `npx eslint .` + `npx next build`. Estes três comandos **devem passar ao final de cada fase** — sem exceção.
- **Server-first**: leitura via Server Component (`async/await`); mutação via Server Action (`'use server'` + `useActionState`). Nunca `useEffect` para fetch.
- **Validação dupla**: Zod no front (UX) + Bean Validation no back (real). Front valida pra dar feedback rápido; verificação real é no back.
- **Alert inline, sem toast** ([14 §7](14-ui-padroes.md)).

---

## Resumo das fases

| Fase | Tema | Esforço | Depende de back |
|---|---|---|---|
| 0 | Setup + Docker do front | P | back-0 |
| 1 | Autenticação (login, sessão, layout privado) | M | back-1 |
| 2 | Shell do app (Sidebar, Topbar, componentes UI base) | M | back-1 |
| 3 | Cadastros mestres (5+ telas) | G | back-2 |
| 4 | Configurações (admin) | P | back-3 |
| 5 | Serviços (listagem + detalhe + edição) | M | back-4 |
| 6 | Ordens de Serviço + impressão | M | back-5 |
| 7 | Custos (lançar + visualizar resumo) | M | back-6 |
| 8 | Anexos PDF | P | back-7 |
| 9 | Relatórios | M | back-8 |
| 10 | Dashboard + polimento | M | tudo |

---

## Fase 0 — Setup + Docker

### Objetivo
Esqueleto Next.js rodando em Docker, com Tailwind v4, estrutura de pastas e helpers da camada `lib/` no lugar.

### Entregáveis

**Bootstrap**
- `npx create-next-app@latest frontend --typescript --app --eslint --tailwind`
- Atualizar para Next 16 + React 19 (se o create-next-app já não vier)
- TypeScript strict no `tsconfig.json`
- `next.config.ts`: `output: 'standalone'` (necessário pro Dockerfile)

**Estrutura de pastas** (conforme [14 §9](14-ui-padroes.md))
```
frontend/
├── app/
│   ├── (publico)/login/
│   ├── (privado)/          (ainda sem páginas)
│   ├── actions/            (vazio)
│   ├── lib/
│   │   ├── cliente-api.ts          ← stub com fetch + tipos
│   │   ├── sessao.ts                ← stub
│   │   ├── definicoes.ts            ← tipos canônicos (UsuarioResumoDto, Papel, ErroRespostaBackend)
│   │   ├── esquemas/                ← vazio
│   │   ├── moeda.ts, data.ts
│   ├── globals.css                  ← @theme com paleta de [14 §3]
│   └── layout.tsx
├── components/
│   ├── ui/                          ← vazio (preenche na Fase 2)
│   └── app/                         ← vazio
├── proxy.ts                         ← stub (next 16)
├── Dockerfile
└── .env.local.example
```

**Helpers**
- `cliente-api.ts`: função `clienteApi<T>` que centraliza fetch (timeout 15s, injeta cookie, lança `ErroApi` / `ErroConexao` conforme [09 §4](09-arquitetura.md))
- `moeda.ts`: `centavosParaReais`, `reaisParaCentavos`
- `data.ts`: helpers para ISO-8601 e `América/Sao_Paulo`

**Tailwind v4**
- `globals.css` com `@import "tailwindcss"` + `@theme` da paleta proposta no [14 §3](14-ui-padroes.md)
- Scrollbar customizado, fontes (Inter via `next/font/google`)

**Docker**
- `Dockerfile` multi-stage (deps → build → standalone runtime)
- Atualizar `docker-compose.yml` da raiz adicionando serviço `frontend`

### Definition of Done
- `docker-compose up -d` sobe front + back + postgres
- `http://localhost:3000` carrega uma página vazia ("Em construção")
- `npx tsc --noEmit` zero erros
- `npx eslint .` zero warnings
- `npx next build` verde

### Riscos / atenção
- Versões: Next 16 + React 19 + Tailwind v4 ainda têm gotchas — checar `AGENTS.md` se ele estiver no monorepo
- `output: 'standalone'` precisa de `outputFileTracingRoot` em alguns casos

---

## Fase 1 — Autenticação

### Objetivo
Login funcional, sessão em cookie httpOnly, redirecionamento para login quando token expira, layout `(privado)` que verifica JWT em duas camadas.

### Entregáveis

**Tela `/login`**
- `app/(publico)/login/page.tsx` (Server Component)
- `formulario-login.tsx` (Client Component com `useActionState`)
- Server Action `app/actions/auth/entrar.ts`:
  - `'use server'`
  - Schema Zod (`loginSchema`)
  - `safeParse`
  - Chama `clienteApi<TokenResposta>('/auth/login', ...)`
  - Lê `Set-Cookie` do response, repassa via `cookies().set(...)` (httpOnly, sameSite=Lax, secure em prod)
  - Em erro 401/403, retorna `{ erro }`
  - Em sucesso, `redirect('/dashboard')` **fora** do try/catch

**Sessão**
- `lib/sessao.ts`:
  - `lerSessao()`: lê cookies, decodifica JWT (camada otimista), retorna `SessaoUsuario` ou null
  - `verificarSessao()`: jwtVerify RS256 (camada segura)
  - `encerrarSessao()`: limpa cookies, chama `/auth/logout`

**proxy.ts** (camada 1)
- `decodeJwt()` otimista — verifica `exp` e `aud === 'tenant'`
- Rotas privadas sem cookie → redirect `/login`

**Layout `(privado)`**
- `app/(privado)/layout.tsx` — `jwtVerify()` real
- Em falha com cookie presente, redirect para `/sair`
- Provê `SessaoUsuario` para descendentes via Server Component props

**`/sair` route handler**
- `app/(publico)/sair/route.ts` — limpa cookies e redireciona

**Alert inline**
- `components/ui/Alert.tsx` (variantes info/success/warning/danger; `dismissible`)
- Erro de login renderiza `<Alert variant="danger">`

### Definition of Done
- Login com admin bootstrap funciona, redireciona pra `/dashboard` (placeholder)
- Sem cookie ou cookie inválido → redirect pra `/login`
- `/sair` limpa cookies e volta pra login
- Erros 401/422 do back aparecem no Alert inline

### Riscos / atenção
- Cookie `secure=true` falha em HTTP local — usar variável de ambiente `NODE_ENV=development` para condicionar
- JWT public key precisa ser lida do `.env.local` como PEM multilinha — escapar `\n` se necessário

---

## Fase 2 — Shell do app + componentes UI base

### Objetivo
Layout do app pronto (Sidebar + Topbar) e biblioteca mínima de componentes UI funcionando.

### Entregáveis

**Componentes UI** em `components/ui/`
- `Button.tsx` (variantes primary/secondary/outline/ghost/danger/success; tamanhos xs/sm/md/lg; `loading`, `icon`, `iconRight`, `fullWidth`)
- `Input.tsx` (com `label`, `error`, `hint`, `iconLeft`, `iconRight`)
- `Textarea.tsx`
- `Select.tsx`
- `Checkbox.tsx`
- `Card.tsx` (com `title`, `subtitle`, `actions`, `padding`, `hover`)
- `Badge.tsx` (com `dot`)
- `Modal.tsx` (ESC fecha, backdrop clica fecha, foco gerenciado)
- `SearchBar.tsx`
- `Table.tsx` (genérica `<T>` com `Column<T>`, `onRowClick`, `loading`, `emptyMessage`)
- `Pagination.tsx`
- `Tabs.tsx`
- `Avatar.tsx`

**Shell** em `components/app/`
- `Sidebar.tsx`:
  - Gradient azul (`from-primary-glow to-primary-mid`)
  - Itens conforme [14 §5](14-ui-padroes.md) (Dashboard, Serviços, OS, Clientes, Equipamentos, Técnicos, Veículos, Peças, Relatórios, Configurações)
  - Recolhível (`useState` para `expandida`)
  - Filtro por papel: Relatórios só para gerente+admin; Configurações só admin
  - Item ativo via `usePathname()`
- `Topbar.tsx`:
  - Busca global (placeholder)
  - Avatar com dropdown (perfil, sair)
- `NavegacaoMobile.tsx`:
  - Botão hambúrguer + drawer

**Layout privado**
- `app/(privado)/layout.tsx` finalizado com Sidebar + Topbar + área `<main>`
- `bg-background`, padding `p-6` (desktop) / `p-4` (mobile)

**Placeholder `/dashboard`**
- Página vazia com título "Dashboard" e card "Em construção"

### Definition of Done
- Sidebar recolhe/expande
- Item ativo destacado
- Sidebar oculta itens conforme papel (operador não vê Relatórios/Configurações)
- Em mobile, hambúrguer abre drawer
- Todos os componentes UI são utilizáveis (smoke test visual)
- `tsc`/eslint/build verdes

---

## Fase 3 — Cadastros mestres

### Objetivo
CRUD via UI para todas as entidades mestres.

### Entregáveis (5 telas grandes)

#### 3a. Clientes
- `/clientes` — listagem paginada + busca por nome/documento + filtro ativo
- `/clientes/novo` — formulário (tipo PF/PJ, documento, nome, fantasia)
- `/clientes/[id]` — detalhe com tabs:
  - **Dados** — editar cliente
  - **Unidades** — listar/criar/editar/excluir unidades (modal)
  - **Contatos** — listar/criar/editar/excluir contatos (modal)
  - **Equipamentos** — listar por unidade (link pra cadastrar equipamento)

#### 3b. Equipamentos
- `/equipamentos` — listagem com filtro por cliente/unidade
- Formulário (em modal ou página) com marca, modelo, tipo (select), capacidade, número de série, localização interna, datas

#### 3c. Técnicos
- `/tecnicos` — listagem
- Formulário: cria usuário + cadastro Tecnico em transação única (back faz isso). Campos: nome, email, senha inicial, valor/hora (em reais — converte para centavos), especialidade

#### 3d. Veículos
- `/veiculos` — listagem
- Formulário: placa, marca, modelo, ano, status

#### 3e. Peças, Fornecedores, Unidades de medida
- `/pecas` — catálogo simples
- `/fornecedores` — cadastro simples
- `/configuracoes/unidades-medida` (admin) — listagem/edição

### Padrões em todas as telas
- Server Component faz fetch (`clienteApi<PaginaResposta<T>>`)
- Tabela com `onRowClick` → detalhe ou modal de edição
- Server Action para criar/editar/excluir
- Schema Zod por entidade em `app/lib/esquemas/`
- Validação por campo + Alert para erro geral
- Estado vazio com mensagem + CTA

### Definition of Done
- Todas as 5 famílias têm CRUD completo funcional via UI
- Validação client-side (Zod) bate com a do back
- Soft delete reflete na listagem (filtro `?ativo=true` default)
- Construções aninhadas (cliente ↔ unidade ↔ equipamento) funcionam
- `tsc`/eslint/build verdes

### Riscos / atenção
- **Fase mais longa.** Considerar dividir em 3a/3b/3c separadas no acompanhamento.
- Componente `UploadValorEmReais` (mascara R$ + converte pra centavos) — fazer um helper reutilizável

---

## Fase 4 — Configurações (admin)

### Objetivo
Telas de configuração do sistema acessíveis só pelo admin.

### Entregáveis

- `/configuracoes` — sumário com links
- `/configuracoes/conta` — perfil da empresa (logo, dados)
- `/configuracoes/markup` — input de markup percentual com salvar (server action)
- `/configuracoes/valor-km` — input de R$/km (converte para centavos)
- `/configuracoes/tipos-servico` — lista, renomear, ativar/desativar
- `/configuracoes/categorias-custo` — lista, renomear, ativar/desativar (sem botão "novo")
- `/configuracoes/usuarios` — listar, criar, ativar/desativar
- `/configuracoes/listas-auxiliares` — unidades de medida

### Permissão
- Layout `app/(privado)/configuracoes/layout.tsx` verifica `papel === 'ADMIN'` e redireciona se não for

### Definition of Done
- Admin altera markup, valor reflete no cálculo do preço (testar visualmente em um serviço com custos)
- Operador acessando `/configuracoes` → 403 ou redirect

---

## Fase 5 — Serviços

### Objetivo
Listagem, cadastro e detalhe (sem OS ainda) de Serviços.

### Entregáveis

- `/servicos` — listagem com filtros: status, cliente, tipo, período
  - Colunas: número, cliente, tipo, status (badge), data início prevista, data fim prevista
- `/servicos/novo` — formulário: cliente (autocomplete), tipo, descrição, datas
- `/servicos/[id]` — detalhe com header (número, badge status, cliente) + abas:
  - **Dados** (esta fase)
  - **OS** (placeholder)
  - **Custos** (placeholder)
  - **Anexos** (placeholder)
- Ações no header: **Editar** (se não-Concluído), **Finalizar Serviço** (com modal de confirmação), **Cancelar Serviço**

### Definition of Done
- Listagem com paginação e filtros funciona
- Criar Serviço retorna o número (`0001`)
- Editar Serviço Concluído → botão desabilitado + tentativa via API retorna 422
- Finalizar Serviço passa status para `Concluído` e tranca ações de edição

---

## Fase 6 — Ordens de Serviço + impressão

### Objetivo
Abrir OS dentro de um Serviço, listar, imprimir PDF, digitar dados da execução.

### Entregáveis

**Tab "OS" do detalhe do Serviço**
- Lista das OS do serviço com badge de status
- Botão "Abrir OS" → modal com:
  - Descrição da atividade
  - Multi-select de técnicos
  - Multi-select de veículos
  - Multi-select de equipamentos (filtrados pelas unidades do cliente do serviço)
- Cada linha clicável → detalhe da OS

**`/ordens-servico/[id]`** (detalhe)
- Header: código (`0001-00012`), badge status, link pro Serviço pai
- Dados: descrição, equipe, veículos, equipamentos
- Botão **Imprimir** → `POST /ordens-servico/{id}/imprimir`, abre PDF em nova aba (`window.open(URL.createObjectURL(blob))`)
- Botão **Digitar execução** → modal com:
  - Hora início / Hora fim
  - O que foi feito (textarea)
  - Observações
  - Impedimentos
  - Upload do scan da OS (PDF único) — usa o componente da Fase 8 (placeholder por agora)
- Botão **Cancelar OS**

**`/ordens-servico`** (listagem geral)
- Para visão gerencial: todas as OS, filtrável

### Definition of Done
- Abrir OS funciona, código aparece (`SSSS-NNNNN`)
- Impressão abre PDF correto em nova aba
- Status muda visualmente após cada ação
- Operador não consegue editar OS de Serviço Concluído

---

## Fase 7 — Custos

### Objetivo
Lançar custos no Serviço (5 categorias) e exibir resumo financeiro (custo + markup + preço de venda).

### Entregáveis

**Tab "Custos" do detalhe do Serviço**
- Cards no topo: custo total, markup aplicado, preço de venda
- Botão "Lançar custo" → modal com select de categoria → formulário específico:
  - **Mão de obra**: técnico (select), horas (number)
  - **Deslocamento**: km (number) + descrição opcional
  - **Peças/Materiais**: descrição + valor (reais)
  - **Terceiros**: descrição + valor (reais)
  - **Hospedagem/Alimentação**: descrição + valor (reais)
- Tabela de lançamentos: data, categoria, descrição (resumo), valor (formatado em reais)
- Edição inline ou via modal
- Botão excluir (com confirmação)

**Permissões na UI**
- Botões de editar/excluir desabilitados quando Serviço Concluído **e** o usuário é operador
- Tooltip explicando

### Definition of Done
- Lançar cada categoria funciona
- Cálculo bate visualmente com o back (`GET /servicos/{id}/resumo-financeiro`)
- Snapshot mantido (alterar valor/hora do técnico → custos antigos não mudam)
- Operador tentando editar pós-Concluído via API → 403

---

## Fase 8 — Anexos PDF

### Objetivo
Upload de PDFs no Serviço (múltiplos) e na OS (1 fixo).

### Entregáveis

**Componente `UploadPDF`** (reutilizável)
- Drag-and-drop + click pra escolher
- Valida no client: extensão `.pdf`, tamanho ≤ 10 MB
- Mostra progresso
- Lista de erros amigáveis

**Tab "Anexos" do detalhe do Serviço**
- Upload (múltiplo) com descrição opcional
- Lista: nome, descrição, tamanho, data, quem enviou + ações (download, excluir)
- Click no nome → abre PDF em nova aba

**Anexo da OS** (na Fase 6, agora completamos)
- Substitui o placeholder do "Digitar execução" pelo `UploadPDF`
- Upload único, substitui o anterior
- Exibe metadados se já houver anexo

**Permissão**
- Excluir/substituir após Concluído: só gerente/admin

### Definition of Done
- Upload de PDF válido funciona
- Tentar upload de imagem/zip renomeada como `.pdf` → erro do back (magic bytes) exibido como Alert
- Download abre PDF inline
- Anexo persistente entre reinicializações do container

---

## Fase 9 — Relatórios

### Objetivo
3 telas de relatório acessíveis a gerente/admin.

### Entregáveis

**`/relatorios`** — sumário com 3 cards/links

**`/relatorios/os-por-status`**
- Filtros: período, cliente, técnico
- Cards de contagem por status no topo
- Tabela detalhada das OS

**`/relatorios/custos-por-servico`**
- Filtros: período, cliente, tipo, status
- Colunas: serviço, cliente, descrição, custo por categoria (5), custo total, preço de venda
- Totais no rodapé

**`/relatorios/custos-por-cliente`**
- Filtros: período
- Colunas: cliente, qtde serviços, qtde OS, custo total, preço total

### Opcional V1
- Botão "Exportar CSV" — gerar no client a partir dos dados já carregados

### Definition of Done
- Filtros funcionam, paginação correta
- Operador tentando acessar → 403 ou redirect
- Valores em reais formatados corretamente

---

## Fase 10 — Dashboard + polimento

### Objetivo
Tela inicial após login + acabamento final.

### Entregáveis

**`/dashboard`**
- 4-6 KPIs no topo (Cards pequenos):
  - OS abertas
  - OS pendentes de digitação (gerencial)
  - Serviços em execução
  - Custo do mês corrente (preço de venda — admin/gerente)
- Listas resumidas:
  - Últimas 10 OS impressas
  - Próximos Serviços (com data início prevista nos próximos 7 dias)

**Acessibilidade**
- Pass por todos os formulários: `htmlFor`, `aria-label`, foco visível
- Navegação por teclado em modais

**Mobile**
- Pass por todas as telas em viewport pequeno (~375px)
- Sidebar como drawer
- Tabelas com scroll horizontal ou layout responsivo

**Polimento**
- Tooltips em botões desabilitados explicando o motivo
- Mensagens de estado vazio com ilustração ou ícone
- Estados de loading consistentes
- Ajuste fino da paleta se necessário

### Definition of Done
- Dashboard mostra KPIs corretos para o papel do usuário
- App funcional em mobile (responsivo até 375px)
- `tsc`/eslint/build verdes
- Smoke test manual: login → criar cliente → criar equipamento → criar serviço → abrir OS → imprimir → digitar → lançar custo → relatório

---

## Ordem de dependências (resumo)

```
0 → 1 → 2 → 3 → 5 → 6
            ↘     ↘
             4     7 → 9
                   8

tudo → 10
```

Fase 4 (configurações) pode ser feita em paralelo com 3 (cadastros) se houver mais de uma pessoa.

---

## Riscos transversais

| Risco | Mitigação |
|---|---|
| Next 16 + React 19 + Tailwind v4 ainda têm gotchas | Olhar `AGENTS.md` do salesys; manter `npx next build` verde a cada PR |
| Servidor de dev quebrar com cookies httpOnly em HTTP | Configurar `secure` condicional via `NODE_ENV` |
| Layout do PDF da OS exigir iteração | Conectar a tela de impressão na fase 6 e iterar visualmente |
| Upload de PDF muito grande travar UI | Validar tamanho **antes** de fazer upload; mostrar erro local |
| Permissões esquecidas | Cada rota privada **deve** ter checagem no layout ou na página (`SessaoUsuario.papel`) |
| Esquemas Zod fora de sincronia com DTOs Java | Convencionar: ao mudar DTO no back, atualizar Zod no mesmo PR |
| Performance de listagens grandes | Server-side pagination obrigatória; sem `loadAll` no client |
