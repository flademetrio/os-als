# OS-ALS

Sistema interno de gestao de **Ordens de Servico** para a **ALS Industria**,
empresa de ar condicionado e climatizacao. Aplicacao single-tenant.

O sistema cobre o fluxo operacional completo: cadastro de clientes, unidades,
equipamentos, tecnicos, veiculos e pecas; abertura de **Servicos** e das
**Ordens de Servico (OS)** vinculadas; impressao da OS em PDF; lancamento de
custos; anexos; e relatorios gerenciais.

---

## Tecnologias

**Backend** (`api-osals.java/`)
- Java 17 · Spring Boot 4.0.6 · Maven
- PostgreSQL 16 · Flyway (migrations)
- Spring Security · autenticacao JWT RS256 em cookies httpOnly

**Frontend** (`app-osals.nextjs/`)
- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4 · Zod
- Server Components e Server Actions

**Infra**
- Docker / Docker Compose (PostgreSQL em container)

## Estrutura do repositorio

```
OS-ALS/
├── api-osals.java/      backend Spring Boot
├── app-osals.nextjs/    frontend Next.js
├── documentacao/        documentacao do produto e tecnica (00-18)
├── scripts/             scripts utilitarios (importacoes, smoke test)
└── docker-compose.yml   orquestracao local
```

## Pre-requisitos

- Java 17 (JDK)
- Node.js 20+ e npm
- Docker e Docker Compose
- OpenSSL (para gerar as chaves do JWT)

## Como rodar (modo hibrido — padrao para dev)

PostgreSQL em container; backend e frontend nativos, com hot reload.

### 1. Subir o banco

```bash
docker compose up -d postgres
```

O container expoe a porta **5433** no host (mapeada para 5432 do container,
evitando conflito com um PostgreSQL local).

### 2. Gerar as chaves do JWT

```bash
cd api-osals.java
mkdir -p keys
openssl genrsa -out keys/chave-privada.pem 2048
openssl rsa -in keys/chave-privada.pem -pubout -out keys/chave-publica.pem

# o frontend precisa da chave publica para validar a sessao
mkdir -p ../app-osals.nextjs/keys
cp keys/chave-publica.pem ../app-osals.nextjs/keys/
```

### 3. Rodar o backend

```bash
cd api-osals.java
cp .env.example .env
# no .env, ajuste para o modo nativo:
#   BD_URL=jdbc:postgresql://localhost:5433/osals
./mvnw spring-boot:run
```

Disponivel em http://localhost:8080 (Swagger UI em `/swagger-ui.html`).
Na primeira inicializacao, o backend cria o usuario admin definido em
`BOOTSTRAP_ADMIN_*` no `.env`.

### 4. Rodar o frontend

```bash
cd app-osals.nextjs
cp .env.local.example .env.local
npm install
npm run dev
```

Disponivel em http://localhost:3000.

### Acesso inicial

Use as credenciais do `BOOTSTRAP_ADMIN_*` definidas no `.env` do backend
(o padrao do `.env.example` e `flavio@alsindustria.com.br` / `123`).
Troque a senha apos o primeiro acesso.

## Modo "tudo em Docker" (opcional)

Util para smoke test antes de um PR ou para onboarding rapido. Cada mudanca
de codigo exige rebuild da imagem.

```bash
docker compose up -d --build
curl http://localhost:8080/actuator/health
```

## Scripts utilitarios

Em `scripts/` (executar com o backend no ar):

```bash
node scripts/importar-clientes.mjs <caminho-do-csv>   # importa clientes de um CSV
node scripts/importar-tecnicos.mjs                    # cadastra os tecnicos iniciais
```

## Documentacao

A documentacao completa do produto e da arquitetura esta em
[`documentacao/`](documentacao/README.md) — comece pelo
[00-visao-geral.md](documentacao/00-visao-geral.md).

Destaques:
- [Arquitetura](documentacao/09-arquitetura.md)
- [Modelo de dados](documentacao/08-modelo-de-dados.md)
- [Padroes backend](documentacao/15-padroes-backend.md)
- [Padroes UI/UX](documentacao/14-ui-padroes.md)
