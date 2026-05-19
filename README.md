# OS-ALS

Sistema de gestao de **Ordens de Servico** para empresa de **ar condicionado e climatizacao**.

> Empresa: ALS Industria. Sistema interno, single-tenant.

---

## Arquitetura

Monorepo com 3 componentes:

```
OS-ALS/
├── api-osals.java/       ← backend Spring Boot
├── app-osals.nextjs/     ← frontend Next.js (Fase 0 do front)
├── documentacao/         ← documentacao do produto e tecnica
└── docker-compose.yml    ← orquestracao local (so postgres em dev)
```

Stack: **Java 17 + Spring Boot 4** · **Next.js 16 + Tailwind v4** · **PostgreSQL 16** · **Docker** (so pra infra).

## Como rodar (modo hibrido — padrao para dev)

**Postgres em container, app nativo.** Hot reload rapido, debug direto da IDE.

```bash
# 1. Subir o postgres em container
docker compose up -d postgres

# 2. Configurar variaveis do back
cp api-osals.java/.env.example api-osals.java/.env
# editar BD_URL=jdbc:postgresql://localhost:5432/osals

# 3. Rodar o backend nativo
cd api-osals.java
./mvnw spring-boot:run

# 4. (futuro) Rodar o frontend nativo
# cd app-osals.nextjs
# npm run dev
```

Disponivel em:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend (futuro): http://localhost:3000

## Modo "tudo em Docker" (opcional)

Util para smoke test antes do PR, CI ou onboarding inicial.

```bash
docker compose up -d --build
curl http://localhost:8080/actuator/health
```

Contrapartida: cada mudança no codigo exige rebuild da imagem.

## Documentacao

Toda a documentacao do projeto vive em [`documentacao/`](documentacao/README.md). Comece pelo [00-visao-geral.md](documentacao/00-visao-geral.md) e siga a ordem do README.

Pontos importantes:
- [Plano de implementacao backend](documentacao/16-plano-backend.md)
- [Plano de implementacao frontend](documentacao/17-plano-frontend.md)
- [Padroes backend](documentacao/15-padroes-backend.md)
- [Padroes UI/UX](documentacao/14-ui-padroes.md)
- [Usuarios iniciais](documentacao/18-usuarios-iniciais.md)

## Status

- ✅ Documentacao completa (0–18)
- ✅ Backend — Fase 0 (esqueleto + Docker)
- ✅ Backend — Fase 1 (autenticacao JWT + cookies + bootstrap)
- ✅ Frontend — Fase 0 (esqueleto + login funcional)
- ✅ Frontend — Fase 1 (jwtVerify RS256 + /sair handler)
- ✅ Frontend — Fase 2 (Shell: Sidebar + Topbar + 14 componentes UI)
- ✅ Backend — Fase 2 (cadastros mestres completos)
  - ✅ 2a — Cliente + Unidade + ContatoCliente
  - ✅ 2b — Equipamento + Veículo
  - ✅ 2c — Técnico (com criação de usuário + redefinição de senha)
  - ✅ 2d — Peças + UnidadeMedida + Fornecedor + TipoServiço + CategoriaCusto
- ✅ Backend — Fase 3 (configurações: markup, valor/km)
- ✅ Frontend — Fase 3 (telas de cadastros)
  - ✅ 3a — Cliente (listagem + criar + detalhe com tabs)
  - ✅ 3b — Veículo, Fornecedor, Peça, Técnico, Equipamento
  - ✅ 3c — Configurações admin (financeiro, tipos de serviço, categorias de custo, unidades de medida)
- ⏳ Backend — Fase 4 (Serviço — CRUD + ciclo de vida)
