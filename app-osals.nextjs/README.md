# app-osals.nextjs

Frontend Next.js do sistema OS-ALS — gestao de ordens de servico.

> Documentacao em `../documentacao/`. Padroes em [14-ui-padroes.md](../documentacao/14-ui-padroes.md). Plano em [17-plano-frontend.md](../documentacao/17-plano-frontend.md).

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** strict
- **Tailwind v4** (via `@theme` no `globals.css`, sem `tailwind.config.js`)
- **Zod** para validacao
- **jose** para JWT (`decodeJwt`, `jwtVerify`)
- ESLint 9

## Status atual

✅ **Fase 0 — Esqueleto**
- [x] Projeto via `create-next-app` (Next 16.2.6 + React 19.2.4)
- [x] Paleta "Calm & Clean" (azul sky) em `globals.css` via tokens `@theme`
- [x] Helpers: `cliente-api.ts`, `sessao.ts`, `definicoes.ts`, `moeda.ts`, `data.ts`
- [x] `proxy.ts` (camada 1 de auth — Next 16 convention)
- [x] Tela `/login` com Server Action
- [x] Dockerfile multi-stage

✅ **Fase 1 — Autenticacao real**
- [x] `verificarSessao()` faz `jwtVerify` RS256 com chave publica do back
- [x] Layout `(privado)` redireciona ao `/sair` se token invalido
- [x] Route handler `/sair` limpa cookies e leva ao `/login`

✅ **Fase 2 — Shell do app**
- [x] 14 componentes UI: Button, Input, Textarea, Select, Checkbox, Card, Badge, Alert, Modal, Avatar, SearchBar, Pagination, Table, Tabs
- [x] `Sidebar` com gradiente, recolhivel, 10 itens, ativo destacado, filtro por papel
- [x] `Topbar` com busca + Avatar + dropdown de sair
- [x] `NavegacaoMobile` (drawer hamburguer)
- [x] `ShellPrivado` (Client Component) com Sidebar + Topbar + conteudo
- [x] Dashboard usando Cards + Badge

Proximas fases em [17-plano-frontend.md](../documentacao/17-plano-frontend.md).

## Como rodar

### Modo padrao — dev nativo

```bash
# 1. Configurar variaveis
cp .env.local.example .env.local
# Em .env.local, o default API_BASE_URL=http://localhost:8080 ja funciona

# 2. Rodar (precisa do backend rodando em http://localhost:8080)
npm install
npm run dev
```

Acessar:
- App: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

### Modo Docker

```bash
# Na raiz do monorepo
docker compose up -d --build
```

Frontend disponivel em http://localhost:3000.

## Convencoes

- Idioma: pt-BR (mensagens ao usuario sempre em portugues)
- Server Components por padrao; `'use client'` so quando necessario
- Sem `useEffect` para fetch — Server Components / Server Actions
- Sem toast — usar `<Alert>` inline
- Detalhes em [14-ui-padroes.md](../documentacao/14-ui-padroes.md)
