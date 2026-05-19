# api-osals

Backend Spring Boot do sistema OS-ALS — gestao de ordens de servico.

> Documentacao do projeto: `../documentacao/`. Plano de implementacao: [16-plano-backend.md](../documentacao/16-plano-backend.md).

---

## Stack

- Java 17
- Spring Boot 4.0.6 (Maven)
- PostgreSQL 16
- Flyway (migrations)
- JJWT 0.12.6 (autenticacao JWT RS256 — implementado na Fase 1)
- Springdoc OpenAPI 2.8.6 (Swagger UI em `/swagger-ui.html`)
- JUnit 5 + Mockito + Testcontainers + JaCoCo

## Como rodar

### Modo padrao — hibrido (recomendado para dev)

**Postgres em container, app rodando nativo.** Hot reload do Spring DevTools, debug direto da IDE, builds rapidos.

**Pre-requisitos**:
- Java 17+ (`java -version`)
- Docker Desktop (so pra subir o postgres)

```bash
# 1. Subir o postgres em container
cd ../
docker compose up -d postgres

# 2. Configurar variaveis de ambiente do back
cd api-osals.java
cp .env.example .env
# Editar .env: BD_URL=jdbc:postgresql://localhost:5432/osals
# (em dev nativo o host e 'localhost', nao 'postgres')

# 3. Rodar o backend
./mvnw spring-boot:run
```

Disponivel em:
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

### Modo alternativo — tudo em Docker

Util para **smoke test antes do PR**, **CI** ou **onboarding inicial** (quando voce nao tem Java/Maven instalados).

```bash
# Na raiz do monorepo
cp api-osals.java/.env.example api-osals.java/.env
# No .env, manter BD_URL=jdbc:postgresql://postgres:5432/osals (default — host = nome do servico)

docker compose up -d --build

# Smoke test
curl http://localhost:8080/actuator/health
```

Em contrapartida: cada mudança no codigo exige `docker compose up -d --build` (lento).

## Comandos uteis

```bash
./mvnw test                              # rodar testes
./mvnw verify                            # testes + cobertura JaCoCo
./mvnw package                           # gerar jar (target/api-osals-0.0.1-SNAPSHOT.jar)
./mvnw spring-boot:run                   # rodar em dev

# Apenas o postgres em container
docker compose up -d postgres
docker compose logs -f postgres
docker compose down                      # mantem volume com dados
docker compose down -v                   # reset total (apaga dados)

# Regenerar openapi.json para o repo
curl -s http://localhost:8080/v3/api-docs -o ../documentacao/openapi.json
```

## Status atual

✅ **Fase 0 — Esqueleto + Docker**
- [x] Estrutura modular monolith
- [x] application.yml + logback-spring.xml
- [x] Compartilhado: ErroResposta, PaginaResposta, exceptions, TratadorExcecoesGlobal, MoedaUtil
- [x] OpenAPI + Springdoc
- [x] Dockerfile + docker-compose
- [x] Spring DevTools (hot reload em dev)

✅ **Fase 1 — Autenticacao e usuarios**
- [x] Migrations V002/V003/V004 (usuario, tecnico, token_refresh)
- [x] Entidades JPA + repositorios
- [x] JWT RS256 com JJWT 0.12.6 (gerador, validador, filtro)
- [x] Cookies httpOnly: `osals_at` (access) e `osals_rt` (refresh)
- [x] ServicoAutenticacao: login, refresh com rotacao, logout, lockout por tentativas
- [x] BootstrapUsuariosIniciais: cria 4 usuarios no primeiro boot
- [x] Endpoints: POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/eu

✅ **Fase 2a — Cadastros: Cliente, Unidade, ContatoCliente**
- [x] Migrations V005/V006/V007 com indices e check constraints
- [x] Modulo `cadastro/` com camadas dominio/aplicacao/api
- [x] 3 entidades JPA + 3 repositorios
- [x] DTOs (Criacao/Atualizacao/Resposta/Resumo) com Bean Validation
- [x] Services com soft delete + reativacao + normalizacao de documento
- [x] Permissoes via `@PreAuthorize` (`@EnableMethodSecurity` ativado)
- [x] Endpoints: 6 em `/clientes`, 5 em `/unidades`, 4 em `/contatos`
- [x] DELETE protegido (apenas GERENTE/ADMIN)

Proximas fases em [16-plano-backend.md](../documentacao/16-plano-backend.md).

## Estrutura

```
src/main/java/br/com/osals/
├── OsAlsApplication.java
├── seguranca/                 ← login, JWT, usuario (Fase 1)
│   ├── dominio/
│   ├── aplicacao/
│   ├── infraestrutura/
│   └── api/
├── cadastro/                  ← cliente, equipamento, tecnico, etc. (Fase 2)
├── servico/                   ← Servico, custos (Fases 4 e 6)
├── ordemservico/              ← OS + impressao (Fase 5)
├── anexo/                     ← PDFs do servico e da OS (Fase 7)
├── relatorio/                 ← endpoints agregados (Fase 8)
├── impressao/                 ← geracao de PDF (Fase 5)
└── compartilhado/             ← infra transversal
    ├── api/                   ← ErroResposta, PaginaResposta, TratadorExcecoesGlobal
    ├── config/                ← SegurancaConfig, OpenApiConfig
    ├── excecoes/
    └── util/                  ← MoedaUtil
```

## Geracao de chaves JWT

```bash
# Privada
openssl genrsa -out chave-privada.pem 2048

# Publica
openssl rsa -in chave-privada.pem -pubout -out chave-publica.pem
```

Conteudo dos `.pem` vai inteiro nas variaveis `JWT_CHAVE_PRIVADA` / `JWT_CHAVE_PUBLICA` do `.env`.

## Convencoes

- Idioma: pt-BR sem acentos em todo o codigo, schema, mensagens
- Valores monetarios: sempre em centavos (`Long`)
- Datas em banco: `TIMESTAMPTZ` (UTC); UI converte para America/Sao_Paulo
- Detalhes em [15-padroes-backend.md](../documentacao/15-padroes-backend.md)
