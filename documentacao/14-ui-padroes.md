# 14 — Padrões de UI/UX

Diretrizes de interface, componentes e experiência para o OS-ALS. **Inspirado** no projeto SalesYS (referência interna), mas adaptado ao domínio de **ar condicionado e climatização** e ao escopo da V1.

A intenção aqui é **definir o espírito**, não copiar código. As decisões abaixo guiam a implementação e devem ser respeitadas em qualquer nova tela.

---

## 1. Filosofia

- **Calm & Clean**: interfaces sóbrias, com bastante respiro, sem ruído visual. O sistema é uma ferramenta de trabalho diário — precisa ser silenciosa.
- **Mobile-first**: o operador pode usar tablet/notebook na recepção; layouts devem responder bem em telas menores.
- **Server-first**: a maior parte das telas é Server Component. Cliente só onde precisa de interatividade real (formulários, modais, drag-and-drop).
- **Validação rigorosa em fronteiras**: todo dado externo (formulário, resposta de API) passa por Zod antes de ser usado.
- **Acessibilidade obrigatória**: `aria-label`, `htmlFor`, foco visível, contraste adequado. Nada de truques visuais que quebrem leitores de tela.
- **Sem dependências de UI prontas**: o sistema é construído com componentes próprios, simples e estáveis. Não usar shadcn, Material, Chakra, etc.

---

## 2. Stack do frontend

| Item | Versão alvo | Notas |
|---|---|---|
| Next.js | 16+ (App Router) | Rotas dinâmicas com `params` `Promise`; convenção `proxy.ts` (não `middleware.ts`); `cookies()` é async |
| React | 19+ | Server Actions com `useActionState`; sem `useEffect` para fetch |
| Tailwind CSS | v4 | Configuração via CSS (`@theme` em `globals.css`). Sem `tailwind.config.js` |
| TypeScript | strict | Sem `any` implícito, sem `as` cru |
| Zod | 4+ | Validação de formulários e respostas |
| jose | latest | JWT (`jwtVerify`, `decodeJwt`). **Nunca** `jsonwebtoken` |

**Bibliotecas proibidas**:
- Toast libs (`sonner`, `react-hot-toast`, `react-toastify`) — usar `Alert` inline
- Fetch libs (`swr`, `react-query`, `tanstack-query`) — Next + React 19 cobrem
- UI kits prontos (`shadcn`, `material-ui`, `chakra`, `mantine`) — componentes próprios
- CSS Modules / CSS inline — só Tailwind

---

## 3. Paleta de cores

Inspirada no Calm & Clean do SalesYS, com **ajuste de tom** apropriado ao domínio de climatização (azul mais "fresco", evocando ar/frio).

### Tokens semânticos (proposta)

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#0EA5E9` | Cor principal (azul sky — remete a frio/ar). Botões, links, destaques |
| `--color-primary-dark` | `#0284C7` | Hover do primary |
| `--color-primary-glow` | `#0C4A6E` | Sidebar (gradiente top) |
| `--color-primary-mid` | `#075985` | Sidebar (gradiente bottom) |
| `--color-primary-light` | `#E0F2FE` | Background suave, alerts info |
| `--color-secondary` | `#10B981` | Sucesso, confirmações, status "Concluído" |
| `--color-secondary-dark` | `#059669` | Hover do secondary |
| `--color-bg` | `#F5F5F5` | Fundo da área principal |
| `--color-surface` | `#FFFFFF` | Cards, modais, conteúdo elevado |
| `--color-border` | `#E5E7EB` | Bordas neutras |
| `--color-text-primary` | `#1F2937` | Texto principal |
| `--color-text-secondary` | `#6B7280` | Texto auxiliar |
| `--color-text-muted` | `#9CA3AF` | Placeholders, labels desabilitados |

> 🔸 Paleta é **proposta inicial**. Pode ser ajustada quando houver identidade visual oficial da empresa (logo, marca). Trocar valores no `:root` propaga para todo o app.

### Regras de uso

- **Sempre tokens semânticos** para o tom da marca: `bg-primary`, `text-primary`, `border-primary`, `bg-surface`. **Nunca** literais equivalentes (`bg-sky-500`, `bg-blue-600`).
- **Cores literais Tailwind** (`bg-amber-*`, `bg-rose-*`, `bg-violet-*`) **só para acentos categóricos**: badges de status, diferenciação de KPIs no dashboard, gráficos. Nunca para o tom primário.
- **Vermelho** sempre para destrutivo/erro (`bg-red-500`, `text-red-600`). Verde só para sucesso.

### Cores semânticas por status

| Status do Serviço | Badge sugerido |
|---|---|
| `Em aberto` | `default` (cinza neutro) |
| `Em execução` | `primary` (azul) |
| `Aguardando` | `warning` (âmbar) |
| `Concluído` | `success` (verde) |
| `Cancelado` | `danger` (vermelho) |

| Status da OS | Badge sugerido |
|---|---|
| `Aberta` | `default` |
| `Impressa` | `info` (azul claro) |
| `Pendente de digitação` | `warning` |
| `Concluída` | `success` |
| `Cancelada` | `danger` |

---

## 4. Tipografia

- **Fonte**: `Inter`, com fallback para system fonts (`SF Pro Text`, `Segoe UI`, `system-ui`).
- **Escala**: tailwind padrão (`text-xs` a `text-2xl`).
- **Pesos**: 400 (texto), 500 (rótulos), 600 (títulos), 700 (raro, ênfase).
- **Hierarquia**:
  - Título de página: `text-xl font-semibold` ou `text-2xl font-semibold`
  - Título de card/seção: `text-sm font-semibold`
  - Texto de corpo: `text-sm`
  - Texto auxiliar/labels: `text-xs text-slate-500`

---

## 5. Layout do app

### Estrutura geral

```
┌───────────┬──────────────────────────────────────────┐
│           │ Topbar (busca, usuário, ações globais)   │
│  Sidebar  ├──────────────────────────────────────────┤
│  (azul)   │                                          │
│           │             Conteúdo principal           │
│  (fixa,   │             (fundo cinza claro)          │
│ recolhível│                                          │
│           │             Cards / tabelas / forms      │
│           │                                          │
└───────────┴──────────────────────────────────────────┘
```

### Sidebar

- **Fundo gradiente** vertical: `from-primary-glow` (topo) → `to-primary-mid` (rodapé). Sombra à direita sutil.
- **Logo** no topo + identificação curta abaixo (nome da empresa).
- **Itens de navegação** com ícone (SVG inline, 16-20px) + rótulo curto.
- **Estado ativo**: fundo `bg-primary` cheio + leve sombra. Inativo: `text-white/80` com hover `bg-white/10`.
- **Recolhível** (`expandida` / collapsed para apenas ícones, ~60px de largura). Tooltips quando recolhida.
- **Sub-itens** (Configurações tem filhos como Markup, Tipos, Status, Categorias) — recuados, borda lateral fina.
- **Filtro por permissão**: itens só aparecem se o perfil tiver acesso.

### Sidebar do OS-ALS — itens propostos

| Rótulo | Rota | Mínimo para ver |
|---|---|---|
| Dashboard | `/dashboard` | qualquer |
| Serviços | `/servicos` | qualquer |
| Ordens de Serviço | `/ordens-servico` | qualquer |
| Clientes | `/clientes` | qualquer |
| Equipamentos | `/equipamentos` | qualquer |
| Técnicos | `/tecnicos` | qualquer |
| Veículos | `/veiculos` | qualquer |
| Peças e Fornecedores | `/peças` | qualquer |
| Relatórios | `/relatorios` | gerente, admin |
| Configurações | `/configuracoes` | admin (subitens: usuários, markup, status, tipos, categorias) |

### Topbar

- Altura curta (~56px).
- Barra de busca global no centro (busca de Serviços/OS por número/cliente).
- Avatar do usuário à direita com dropdown (perfil, sair).
- Em mobile, vira menu hambúrguer + título da página.

### Área de conteúdo

- Padding `p-6` (desktop), `p-4` (mobile).
- Fundo `bg-background` (cinza muito claro).
- Cards e tabelas em `bg-surface` (branco) com `rounded-xl` e `shadow-sm`.

---

## 6. Inventário mínimo de componentes UI

A serem implementados em `components/ui/` (genéricos, reutilizáveis):

| Componente | Variantes principais | Quando usar |
|---|---|---|
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`. Tamanhos `xs`/`sm`/`md`/`lg`. Com `loading`, `icon`, `iconRight`, `fullWidth` | Toda ação |
| `Input` | Com `label`, `error`, `hint`, `iconLeft`, `iconRight` | Texto de uma linha |
| `Textarea` | Com `label`, `error`, `hint` | Texto longo (descrição da atividade, observações) |
| `Select` | Mesma API do Input | Listas curtas (status, tipo de serviço) |
| `Checkbox` | Com `label` | Booleanos, listas múltiplas |
| `Card` | Com `title`, `subtitle`, `actions`, `padding`, `hover` | Agrupar conteúdo |
| `Table` | Genérica `<T>` com `Column<T>`, `onRowClick`, `loading`, `emptyMessage` | Listagens |
| `Modal` | Tamanhos `sm`/`md`/`lg`/`xl`. Fecha com ESC e clique no backdrop | Confirmações, formulários curtos |
| `Alert` | `info`/`success`/`warning`/`danger`, com `title` e `dismissible` | Feedback inline em formulário (**sem toast**) |
| `Badge` | `default`/`primary`/`success`/`warning`/`danger`/`info`/`purple`. Tamanho `sm`/`md`. Com `dot` opcional | Status, contadores |
| `Avatar` | Iniciais ou imagem | Usuário no Topbar, listas |
| `SearchBar` | Input com ícone de lupa, debounce | Busca em listagens |
| `Pagination` | Página anterior/próxima, números | Listagens paginadas |
| `Tabs` | Tabs horizontais simples | Telas com múltiplas seções (ex.: detalhe do Serviço: dados, OS, custos, anexos) |

### Padrões de propriedade

- **Variantes** sempre como union literal (`'primary' | 'secondary'` etc.) — não booleans (`isPrimary`).
- **Tamanhos** sempre `xs`/`sm`/`md`/`lg`.
- **Estado de erro** sempre como string opcional (`error?: string`) — exibido em vermelho abaixo do campo.
- **Acessibilidade**: todo `Input` recebe `id` automático derivado do `label` se não for fornecido; `htmlFor` no `<label>`.

---

## 7. Padrões de página

### Listagem (ex.: Serviços, Clientes, Equipamentos)

```
┌─────────────────────────────────────────────────────┐
│  Título da página                  [+ Novo]         │
├─────────────────────────────────────────────────────┤
│  [Busca]    [Filtros: status, cliente...]           │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ Tabela com Column<T>, paginação no rodapé       ││
│  │ Clique na linha → detalhe                       ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

- Título + botão "Novo" no topo direito.
- Filtros em linha logo abaixo (busca textual, filtros por status/data).
- Tabela com `onRowClick` que navega para a tela de detalhe.
- Paginação no rodapé.
- Estado vazio: mensagem amigável + ícone + sugestão ("Nenhum cliente cadastrado. Clique em + Novo para começar").
- Estado de loading: spinner centralizado na área da tabela.

### Detalhe (ex.: detalhe do Serviço)

```
┌─────────────────────────────────────────────────────┐
│  ← Voltar  |  Serviço 0001    [Status badge]        │
│            |  Cliente Acme · Manutenção Corretiva   │
│                                       [Ações...]    │
├─────────────────────────────────────────────────────┤
│  [Tabs: Dados | OS | Custos | Anexos]               │
├─────────────────────────────────────────────────────┤
│  Conteúdo da tab ativa                              │
└─────────────────────────────────────────────────────┘
```

- Cabeçalho com botão de voltar, identificação do recurso e status como badge.
- Ações contextuais no topo direito (Editar, Imprimir, Finalizar — só as relevantes ao status atual).
- Tabs para seccionar conteúdo (especialmente útil em Serviço que tem OS, custos, anexos).

### Formulário (Server Action + Alert inline)

- Layout em 1 ou 2 colunas dependendo da quantidade de campos.
- Botões no rodapé alinhados à direita: `[Cancelar (ghost)] [Salvar (primary)]`.
- `Alert variant="danger"` no topo do form para erro geral.
- Erros por campo abaixo do próprio campo (vermelho).
- **Sem toast de sucesso**:
  - Criação que redireciona → redireciona via Server Action.
  - Modal de edição → fecha após sucesso.
  - Edição inline → `Alert variant="success" dismissible` no topo.

### Dashboard

- 4-6 KPIs no topo (Cards pequenos: total de Serviços abertos, OS pendentes de digitação, custo do mês, etc.).
- Listas/tabelas resumidas abaixo (próximas OS impressas, últimos clientes atendidos).
- Gráfico simples se fizer sentido (custo por mês, OS por status) — biblioteca a definir, ou SVG manual para começar.

---

## 8. Padrões de UX

### Loading
- Spinner do `Button` quando ação está em andamento (`loading={true}`).
- Spinner centralizado em tabelas (estado interno).
- Skeleton screens (placeholders cinzas pulsantes) para áreas grandes — fica para uma evolução, não V1.

### Vazio
- Sempre mensagem clara + CTA quando aplicável.
- Não deixar tabela/lista vazia sem feedback.

### Erros
- 401/403: redirecionar para login ou exibir "Sem permissão para esta operação".
- 404: tela própria "Recurso não encontrado".
- 422 (regra de negócio): exibir mensagem do backend (já vem em pt-BR amigável).
- 500: mensagem genérica "Algo deu errado. Tente novamente."
- Nunca expor stack trace ao usuário.

### Feedback de ação
- **Confirmar antes de destruir**: exclusão sempre passa por modal de confirmação.
- **Sucesso silencioso**: ações que redirecionam não precisam de mensagem; a navegação já é o feedback.
- **Sucesso visível em formulário inline**: `Alert variant="success" dismissible`.

### Estados pós-conclusão
- Botões de edição **desabilitados** em Serviços/OS já concluídos (operador). Para gerente/admin, ficam habilitados.
- Visualmente o status concluído reduz o nível de "convite" da tela (badges verdes, ações secundárias em `ghost`).

---

## 9. Convenções de código

### Nomenclatura

**Português brasileiro para domínio; inglês para sintaxe técnica/framework.**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Arquivos `.tsx`/`.ts` | kebab-case | `formulario-servico.tsx`, `cliente-api.ts` |
| Componentes React | PascalCase pt-BR | `FormularioServico`, `ListaOrdemServico` |
| Funções e variáveis | camelCase pt-BR | `buscarClientes`, `dadosUsuario` |
| Tipos/interfaces | PascalCase pt-BR | `RespostaLogin`, `OrdemServicoDto` |
| Schemas Zod | camelCase + `Schema` | `loginSchema`, `servicoSchema` |
| Rotas (pastas) | kebab-case | `app/(privado)/ordens-servico/` |
| Constantes | SCREAMING_SNAKE_CASE | `TAMANHO_MAX_PDF`, `TIMEOUT_MS` |
| Mensagens ao usuário | pt-BR | — |

> Tipos TypeScript devem **espelhar os DTOs do backend Java** (mesmos nomes, mesmos campos).

### Estrutura de pastas (proposta)

```
frontend/
├── app/
│   ├── (publico)/              ← login, recuperar senha
│   ├── (privado)/              ← rotas com JWT verificado
│   │   ├── dashboard/
│   │   ├── servicos/           /[id]/, /novo/
│   │   ├── ordens-servico/     /[id]/, /novo/
│   │   ├── clientes/           /[id]/, /novo/
│   │   ├── equipamentos/       /[id]/
│   │   ├── tecnicos/
│   │   ├── veiculos/
│   │   ├── pecas/
│   │   ├── relatorios/
│   │   └── configuracoes/      conta/, usuarios/, markup/, listas/
│   ├── actions/                ← Server Actions (`'use server'` na primeira linha)
│   ├── lib/
│   │   ├── cliente-api.ts      ← HTTP client centralizado
│   │   ├── sessao.ts           ← cookies httpOnly + jwtVerify
│   │   ├── definicoes.ts       ← tipos compartilhados
│   │   ├── esquemas/           ← schemas Zod por domínio
│   │   └── moeda.ts, data.ts, cep.ts, viacep.ts, permissoes.ts
│   ├── globals.css             ← @theme tokens + scrollbar
│   └── layout.tsx
├── components/
│   ├── ui/                     ← Button, Input, Card, Table, Modal, Alert, Badge, ...
│   └── app/                    ← Sidebar, Topbar, NavegacaoMobile (específicos do OS-ALS)
├── proxy.ts                    ← camada 1 de auth (decodeJwt otimista)
└── public/                     ← assets, logo da empresa
```

### Server Actions (template)

Toda mutação passa por Server Action:

1. `'use server'` na primeira linha
2. Schema Zod no topo
3. `safeParse` (nunca `parse` cru)
4. Try/catch para erros da API
5. `revalidatePath` / `revalidateTag` em caso de sucesso
6. `redirect` **fora** do try/catch (lança internamente e seria capturado)
7. Retorno tipado: `{ erro?: string, errosCampos?: Record<string, string>, sucesso?: boolean }`

### Server vs Client Components

- **Server Component (padrão)**: nenhuma diretiva. Faz fetch direto, lê cookies, valida sessão.
- **Client Component**: `'use client'` na primeira linha. Só quando há interatividade real (estado local, eventos, refs).
- **Nunca** importar Server Component dentro de Client Component.
- **Nunca** usar `useEffect` para buscar dados — Server Components ou Server Actions cobrem.

---

## 10. Testes (sem framework na V1)

**O frontend não tem framework de testes configurado na V1.** Decisão alinhada com o projeto-inspiração ([api-salesys/app-salesys-nextjs](D:\DEV\projetos\salesys\app-salesys-nextjs)).

### Rede de segurança equivalente

A correção é sustentada por três verificações executáveis (devem passar ao final de qualquer tarefa):

```bash
npx tsc --noEmit       # zero erros de tipo (TypeScript strict)
npx eslint .           # zero warnings novos
npx next build         # zero erros de build (pega Server/Client boundary, uso indevido de APIs server-only, etc.)
```

Esses três comandos cobrem a maior parte dos problemas que testes unitários pegariam num projeto deste porte. **A correção de regras de negócio é responsabilidade do backend**, que tem testes obrigatórios ([15-padroes-backend.md §7](15-padroes-backend.md)).

### Regras

- ❌ **Não criar** `*.test.ts`, `*.test.tsx`, `*.spec.ts` ou `__tests__/`.
- ❌ **Não instalar** Vitest, Jest, Playwright, Cypress ou Testing Library por iniciativa própria.
- ❌ **Não mockar API** (MSW, `nock`, etc.). Mocks só são aceitáveis em estados de loading/erro durante o desenvolvimento da UI, e **nunca** vão para produção.

### Quando entrar framework de testes

Em versões futuras, se algum dos cenários abaixo se materializar:

- Componente complexo de UI (drag-and-drop, máscara avançada, autocomplete) com lógica não-trivial no client
- Necessidade de smoke test E2E pré-deploy (Playwright)
- Regressões recorrentes em fluxos críticos (login, abertura de OS, finalização de Serviço)

Nesse momento, a decisão de framework será tomada explicitamente — provavelmente **Vitest** para unitário e **Playwright** para E2E (são os mais alinhados com o ecossistema Next 16).

---

## 11. Acessibilidade

- Todo `<input>` tem `<label htmlFor>` ou `aria-label`.
- Botões com ícone-só têm `aria-label`.
- Foco visível: anel azul (`focus:ring-2 focus:ring-primary`) em todos os controles.
- Contraste mínimo AA (texto sobre fundo).
- Navegação por teclado funcional: tab para próximo controle, ESC fecha modal.
- Modal: `role="dialog"`, `aria-modal="true"`, foco inicial no diálogo.
- Tabelas com `<thead>`/`<tbody>` semânticos; nunca `<div>` simulando tabela.

---

## 12. Anti-padrões a evitar

- ❌ Usar `alert()` nativo do browser
- ❌ Instalar biblioteca de toast
- ❌ CSS inline (`style={{ ... }}`) — exceto valores dinâmicos calculados
- ❌ `useEffect` para fetch
- ❌ `getServerSideProps`/`getStaticProps` (Pages Router)
- ❌ `middleware.ts` (Next 16 → `proxy.ts`)
- ❌ `any` em TypeScript
- ❌ `as Type` sem narrowing prévio
- ❌ Componentes UI prontos (shadcn, MUI, Chakra) — construir os próprios
- ❌ Cores literais Tailwind (`bg-blue-600`) para o tom principal — usar `bg-primary`
- ❌ Mockar API em produção (mocks só em desenvolvimento)
- ❌ Instalar Vitest, Jest, Playwright, Cypress, Testing Library, MSW por iniciativa própria — sem framework de testes na V1 (ver §10)

---

## 13. Pontos abertos

🔸 **Logo do OS-ALS** — quando houver identidade visual, substituir em `public/`. Sidebar e topbar mostram logo.

🔸 **Paleta final** — proposta acima é inicial; ajustar quando a marca da empresa estiver definida.

🔸 **Biblioteca de gráficos** para o dashboard (custos por mês, etc.) — Recharts, Visx, ou SVG manual. Decisão fica para quando o dashboard for implementado.

🔸 **Modo escuro** — fora da V1, mas tokens semânticos já facilitam adicionar depois.

---

## Referências

- Projeto-inspiração interno (não público): SalesYS — `D:\DEV\projetos\salesys\app-salesys-nextjs\`
- [Tailwind v4 — `@theme` em CSS](https://tailwindcss.com/docs/v4-beta#configuration)
- [Next 16 — App Router](https://nextjs.org/docs/app)
- [React 19 — useActionState](https://react.dev/reference/react/useActionState)
