# 19 — Runbook de produção

Manual operacional do OS-ALS em produção. Abra este documento quando
precisar instalar do zero, fazer uma release, restaurar backup, fazer
rollback ou debugar um incidente.

**Premissas:**

- Servidor Ubuntu 22.04+ (LTS), com Docker Engine e Docker Compose v2.
- Sistema rodando em LAN interna (sem HTTPS no V1).
- Releases manuais — não há CI no V1.
- Owner do GHCR: `flademetrio`.
- Imagens publicadas: `ghcr.io/flademetrio/osals-api` e `ghcr.io/flademetrio/osals-app`.

---

## Índice

1. [Setup inicial do servidor Ubuntu (zero a primeiro deploy)](#1-setup-inicial-do-servidor)
2. [Workflow de release (na máquina de dev)](#2-workflow-de-release)
3. [Workflow de deploy (no servidor)](#3-workflow-de-deploy)
4. [Rollback para versão anterior](#4-rollback)
5. [Restore de backup do banco](#5-restore-de-backup)
6. [Migração Windows → Ubuntu](#6-migra%C3%A7%C3%A3o-windows--ubuntu)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Setup inicial do servidor

Faz **uma vez**, quando o servidor é novo.

### 1.1 Pacotes base

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg openssl rsync git
```

### 1.2 Docker Engine + Compose v2

Siga as instruções oficiais para Ubuntu:
https://docs.docker.com/engine/install/ubuntu/

Resumo:
```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
     -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
     https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Testar:
```bash
docker --version
docker compose version
```

### 1.3 Usuário do sistema

Cria o usuário `osals` com UID **10001** (o mesmo da imagem da API,
para o bind mount funcionar sem `chown`):

```bash
sudo useradd -u 10001 -r -s /usr/sbin/nologin osals
```

### 1.4 Estrutura de pastas em `/srv/os-als/`

```bash
sudo mkdir -p /srv/os-als/{anexos,keys,logs,postgres}
sudo mkdir -p /backup/os-als/postgres
sudo chown -R osals:osals /srv/os-als /backup/os-als
sudo chmod 750 /srv/os-als/anexos /srv/os-als/keys /srv/os-als/logs
sudo chmod 700 /srv/os-als/postgres
```

### 1.5 Chaves JWT (novas, **não** reusar as de dev)

```bash
sudo -u osals openssl genrsa -out /srv/os-als/keys/chave-privada.pem 2048
sudo -u osals openssl rsa  -in  /srv/os-als/keys/chave-privada.pem \
                           -pubout -out /srv/os-als/keys/chave-publica.pem
sudo chmod 600 /srv/os-als/keys/chave-privada.pem
sudo chmod 644 /srv/os-als/keys/chave-publica.pem
```

### 1.6 Clonar o repositório

```bash
sudo mkdir -p /srv/os-als && sudo chown $USER:$USER /srv/os-als
cd /srv/os-als
git clone https://github.com/flademetrio/OS-ALS.git .
```

> Apenas os arquivos de orquestração (`docker-compose.prod.yml`, scripts,
> `documentacao/`) são usados em produção — o código vai compilado dentro
> das imagens do GHCR.

### 1.7 Configurar `.env.prod`

```bash
cp .env.prod.example .env.prod
chmod 600 .env.prod
nano .env.prod
```

Ajustar:
- `OSALS_VERSAO` — a versão que quer subir (ex.: `v1.0.0`).
- `BD_SENHA` — gerar forte (`openssl rand -base64 24`).
- `BOOTSTRAP_ADMIN_SENHA` — provisória; troca pela UI no primeiro login.
- `FRONTEND_URL` e `CORS_ORIGENS_PERMITIDAS` — IP/host real do servidor.

### 1.8 Login no GHCR

A conta do servidor precisa de um PAT do GitHub com escopo
**`read:packages`**. Gere em:
https://github.com/settings/tokens

```bash
docker login ghcr.io -u CONTA-DO-SERVIDOR
# cola o PAT como senha
```

### 1.9 Primeiro deploy

```bash
cd /srv/os-als
./scripts/deploy.sh
```

O script pula o snapshot pré-deploy (postgres ainda não subiu) e segue
direto para o `pull + up + espera healthy`. Flyway aplica as migrations.
O bootstrap admin é criado na primeira inicialização.

### 1.10 Agendar o backup

```bash
sudo crontab -e
```
Adicionar:
```cron
0 2 * * * cd /srv/os-als && ./scripts/backup.sh
```

Verificar manualmente que funciona:
```bash
cd /srv/os-als && ./scripts/backup.sh
ls -lh /backup/os-als/postgres/
tail /var/log/os-als/backup.log
```

---

## 2. Workflow de release

Acontece **na sua máquina de dev**, toda vez que vai liberar uma versão
nova para produção.

### 2.1 Pré-release

- Commit tudo no `main`.
- `git push origin main`.
- Smoke test local (`docker compose up --build` e teste rápido).

### 2.2 Login no GHCR (1x por máquina)

Você precisa de um PAT com escopo **`write:packages`**:
https://github.com/settings/tokens

```bash
docker login ghcr.io -u flademetrio
```

### 2.3 Rodar o release

```bash
./scripts/release.sh 1.0.0
```

O script:
1. Valida o formato (semver).
2. Confere working tree limpo.
3. Builda `osals-api` e `osals-app`.
4. Tag dupla: `v1.0.0` e `latest`.
5. Push das 4 tags pro GHCR.
6. Cria a tag git `v1.0.0` e empurra.

Tempo esperado: 3–8 minutos (Java é o gargalo).

### 2.4 Confirmar no GHCR

https://github.com/flademetrio?tab=packages

---

## 3. Workflow de deploy

Acontece **no servidor**, toda vez que tem uma release nova pra colocar
no ar.

```bash
ssh servidor
cd /srv/os-als
./scripts/deploy.sh v1.0.1
```

O script:
1. Atualiza `OSALS_VERSAO=v1.0.1` no `.env.prod`.
2. Faz snapshot pré-deploy do banco em `/backup/os-als/postgres/pre-deploy-*.sql.gz`.
3. `docker compose pull` (puxa as novas imagens do GHCR).
4. `docker compose up -d` (recria containers).
5. Espera backend ficar `healthy` (timeout 180s).
6. Limpa imagens antigas localmente (mantém as últimas 3 versões).

Downtime esperado: 30–90s.

### Confirmar pós-deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
curl -s http://localhost:8080/actuator/health
curl -sI http://localhost:3000/
```

---

## 4. Rollback

Se a release nova der problema, volta pra anterior em ~30s:

```bash
cd /srv/os-als
./scripts/deploy.sh v1.0.0     # versao anterior
```

> **Importante:** rollback funciona se a release problemática NÃO rodou
> migration destrutiva. Migrations devem ser sempre **aditivas** (adicionar
> colunas, nunca remover/renomear). Se uma migration destrutiva escapou,
> precisa restaurar do snapshot (próxima seção).

---

## 5. Restore de backup

Cenário: precisa voltar o banco para um ponto antes do desastre.

### 5.1 Identificar o snapshot

```bash
ls -lt /backup/os-als/postgres/
```

Arquivos `osals-YYYYMMDD-HHMMSS.sql.gz` (backups diários) ou
`pre-deploy-VERSAO-TIMESTAMP.sql.gz` (snapshots de deploy).

### 5.2 Parar os apps (mantém o postgres)

```bash
cd /srv/os-als
docker compose -f docker-compose.prod.yml --env-file .env.prod stop backend frontend
```

### 5.3 Drop e recreate do banco

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres \
  psql -U osals -c "DROP DATABASE osals;"
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres \
  psql -U osals -c "CREATE DATABASE osals OWNER osals;"
```

### 5.4 Restaurar o dump

```bash
gunzip -c /backup/os-als/postgres/osals-XXXXXXXX-XXXXXX.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres \
    psql -U osals osals
```

### 5.5 Subir os apps de volta

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Aguardar ficar healthy e confirmar (`curl /actuator/health`).

---

## 6. Migração Windows → Ubuntu

Quando for trocar o servidor Windows pelo Ubuntu definitivo.

### 6.1 Na máquina Windows (origem)

1. Parar o sistema: `docker compose down`.
2. Backup completo do banco:
   ```bash
   ./scripts/backup.sh
   ```
3. Copiar para um local seguro (USB, NAS, scp):
   - `/backup/os-als/postgres/osals-LATEST.sql.gz`
   - Conteúdo de `/srv/os-als/anexos/` (rsync ou tar)
   - Conteúdo de `/srv/os-als/keys/` (chaves JWT — guardar em cofre)

### 6.2 Na máquina Ubuntu (destino)

1. Fazer o setup completo da seção [1. Setup inicial do servidor](#1-setup-inicial-do-servidor)
   **exceto** o passo 1.5 (gerar chaves) — vamos restaurar as existentes.
2. Restaurar chaves JWT do backup:
   ```bash
   sudo cp chave-privada.pem chave-publica.pem /srv/os-als/keys/
   sudo chown osals:osals /srv/os-als/keys/*
   sudo chmod 600 /srv/os-als/keys/chave-privada.pem
   sudo chmod 644 /srv/os-als/keys/chave-publica.pem
   ```
3. Restaurar anexos:
   ```bash
   sudo rsync -a anexos-old/ /srv/os-als/anexos/
   sudo chown -R osals:osals /srv/os-als/anexos
   ```
4. Subir o sistema (vai criar banco vazio):
   ```bash
   cd /srv/os-als
   ./scripts/deploy.sh
   ```
5. Restaurar o banco (seção [5. Restore](#5-restore-de-backup)).

---

## 7. Troubleshooting

### 7.1 Containers não sobem após deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail 100
```

Causas comuns:
- `.env.prod` com placeholder não substituído (`TROCAR-POR-...`).
- Postgres já estava rodando com outra senha (perde sincronia entre `.env.prod` e o volume).
  - Fix: descobrir a senha que está no volume (`docker compose exec postgres env`) e alinhar
    no `.env.prod`, OU dropar o volume (perde dados, só faz se for instalação nova).
- Permissões em `/srv/os-als/...` (precisam ser do usuário `osals`).
  - Fix: `sudo chown -R osals:osals /srv/os-als`.

### 7.2 Backend fica unhealthy

```bash
docker logs osals-backend --tail 200
```

Causas comuns:
- Flyway falhou em uma migration → checar a mensagem.
- Chaves JWT não foram encontradas → conferir o bind mount de `/srv/os-als/keys` e os caminhos no `.env.prod`.
- Banco não acessível → `docker compose exec postgres pg_isready`.

### 7.3 Frontend retorna 502 / não carrega

```bash
docker logs osals-frontend --tail 200
```

Causas comuns:
- `API_BASE_URL` errado no `.env.prod` (deve ser `http://backend:8080` na rede do compose).
- Backend ainda não está healthy.
- Chave pública JWT ausente em `/srv/os-als/keys/` (frontend precisa para validar tokens).

### 7.4 Espaço em disco crescendo

```bash
df -h
du -sh /var/lib/docker /srv/os-als /backup/os-als
```

Limpar:
```bash
# Imagens antigas (o deploy.sh já cuida das ultimas 3 versoes,
# mas pode ter sobras de testes)
docker system prune -a --volumes

# Backups antigos (já tem rotacao de 30 dias, mas se mudou a politica)
find /backup/os-als/postgres -mtime +30 -delete
```

### 7.5 Restaurar acesso de admin perdido

Se ninguém lembra a senha do admin:

```bash
# Resetar a senha direto no banco (gera hash bcrypt antes)
docker compose exec -T postgres psql -U osals osals -c \
  "UPDATE usuario SET senha_hash='$2a$10$...' WHERE email='admin@alsindustria.com.br';"
```

Para gerar um hash bcrypt, dá pra usar qualquer biblioteca/CLI ou um
container temporário:
```bash
docker run --rm httpd:2.4-alpine htpasswd -bnBC 12 "" "NOVA-SENHA" | tr -d ':\n'
```

### 7.6 Logs detalhados de um serviço específico

```bash
# Backend nas últimas 500 linhas
docker logs osals-backend --tail 500 -f

# Postgres
docker logs osals-postgres --tail 100

# Frontend
docker logs osals-frontend --tail 100
```

### 7.7 Acessar shell em um container (debug)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend  sh
docker compose -f docker-compose.prod.yml --env-file .env.prod exec postgres sh
```

(O frontend roda como `nextjs` non-root sem shell útil; menos prático.)

---

## Apêndice — comandos de mão

| Ação | Comando |
|---|---|
| Status geral | `docker compose -f docker-compose.prod.yml ps` |
| Logs do backend (follow) | `docker logs osals-backend -f` |
| Backup manual | `./scripts/backup.sh` |
| Deploy nova versão | `./scripts/deploy.sh v1.X.Y` |
| Rollback | `./scripts/deploy.sh v1.X.(Y-1)` |
| Parar tudo | `docker compose -f docker-compose.prod.yml stop` |
| Subir tudo | `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d` |
| Health do backend | `curl http://localhost:8080/actuator/health` |

---

> Documento vivo: atualize sempre que aparecer um cenário novo de
> incidente ou um passo que faltava.
