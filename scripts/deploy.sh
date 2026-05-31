#!/usr/bin/env bash
# =====================================================================
# Deploy de uma release no servidor de producao.
#
# Uso:
#   ./scripts/deploy.sh                  # usa OSALS_VERSAO do .env.prod
#   ./scripts/deploy.sh v1.0.1           # forca uma versao (atualiza .env.prod)
#
# O que faz:
#   1. Valida que .env.prod existe e tem OSALS_VERSAO definido
#   2. Snapshot rapido do banco (pg_dump.gz) em /backup/os-als/postgres/
#   3. docker compose pull
#   4. docker compose up -d
#   5. Espera backend ficar healthy (timeout 180s)
#   6. Mostra status e snapshot
#   7. Limpa tags antigas localmente (mantem as ultimas 3 versoes)
#
# Pre-requisitos no servidor:
#   - Estar em /srv/os-als (ou pasta com docker-compose.prod.yml + .env.prod)
#   - docker login ghcr.io feito com PAT read:packages
#   - /backup/os-als/postgres/ existe e writable
# =====================================================================

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BACKUP_DIR="/backup/os-als/postgres"
RETENCAO_VERSOES=3
GHCR_OWNER="flademetrio"

# ---------- Sanity ----------
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: $COMPOSE_FILE nao encontrado nesta pasta." >&2
  exit 1
fi
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Erro: $ENV_FILE nao encontrado. Copie .env.prod.example e ajuste." >&2
  exit 1
fi

# Le um valor do .env.prod tolerando '=' no proprio valor
get_env() {
  grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-
}

# ---------- Determinar a versao ----------
if [[ $# -ge 1 ]]; then
  OVERRIDE="$1"
  if ! [[ "$OVERRIDE" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$|^latest$ ]]; then
    echo "Erro: versao deve ser 'vX.Y.Z' ou 'latest' (recebi: $OVERRIDE)." >&2
    exit 1
  fi
  if grep -q "^OSALS_VERSAO=" "$ENV_FILE"; then
    sed -i "s|^OSALS_VERSAO=.*|OSALS_VERSAO=${OVERRIDE}|" "$ENV_FILE"
  else
    echo "OSALS_VERSAO=${OVERRIDE}" >> "$ENV_FILE"
  fi
  echo "==> .env.prod atualizado: OSALS_VERSAO=${OVERRIDE}"
fi

VERSAO=$(get_env OSALS_VERSAO)
if [[ -z "$VERSAO" ]]; then
  echo "Erro: OSALS_VERSAO nao definido em $ENV_FILE." >&2
  exit 1
fi

echo "==> Deploy versao: ${VERSAO}"

# ---------- Snapshot do banco (pre-deploy) ----------
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DUMP_FILE="${BACKUP_DIR}/pre-deploy-${VERSAO}-${TIMESTAMP}.sql.gz"
echo "==> Snapshot do banco em ${DUMP_FILE}..."

BD_USUARIO=$(get_env BD_USUARIO)
BD_NOME=$(get_env BD_NOME)

# Tenta dumpar — se o postgres ainda nao tiver subido, pula com aviso
if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps postgres \
   --status running --quiet >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_dump -U "$BD_USUARIO" "$BD_NOME" | gzip > "$DUMP_FILE"
  if [[ ! -s "$DUMP_FILE" ]]; then
    echo "Erro: snapshot ficou vazio. Abortando deploy." >&2
    rm -f "$DUMP_FILE"
    exit 1
  fi
  echo "    snapshot OK ($(du -h "$DUMP_FILE" | cut -f1))"
else
  echo "    postgres ainda nao subiu — pulando snapshot (primeira instalacao?)"
fi

# ---------- Pull ----------
echo "==> Pull das imagens novas..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

# ---------- Up ----------
echo "==> Subindo containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# ---------- Espera backend healthy ----------
echo "==> Aguardando backend ficar healthy..."
TIMEOUT=180
INTERVALO=3
ESPERADO=0
STATUS="starting"
while [[ $ESPERADO -lt $TIMEOUT ]]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' \
           osals-backend 2>/dev/null || echo "starting")
  if [[ "$STATUS" == "healthy" ]]; then
    echo "    backend healthy apos ${ESPERADO}s"
    break
  fi
  sleep $INTERVALO
  ESPERADO=$((ESPERADO + INTERVALO))
  printf "    %s... (%ds)\n" "$STATUS" "$ESPERADO"
done

if [[ "$STATUS" != "healthy" ]]; then
  echo "Erro: backend nao ficou healthy em ${TIMEOUT}s." >&2
  echo "      Veja: docker logs osals-backend --tail 80" >&2
  exit 1
fi

# ---------- Limpar tags antigas localmente ----------
echo "==> Limpando tags antigas (mantem ultimas ${RETENCAO_VERSOES})..."
for IMG in osals-api osals-app; do
  TAGS_VELHAS=$(docker images "ghcr.io/${GHCR_OWNER}/${IMG}" --format '{{.Tag}}' \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' \
    | sort -V -r \
    | tail -n +$((RETENCAO_VERSOES + 1))) || true
  for TAG in $TAGS_VELHAS; do
    echo "    removendo ghcr.io/${GHCR_OWNER}/${IMG}:${TAG}"
    docker rmi "ghcr.io/${GHCR_OWNER}/${IMG}:${TAG}" >/dev/null 2>&1 || true
  done
done

# ---------- Resumo ----------
cat <<EOF

============================================================
  OK  Deploy ${VERSAO} concluido.

  Status:
    backend  -> healthy
    frontend -> servindo na porta 3000

  Snapshot pre-deploy:
    ${DUMP_FILE}

  Rollback (versao anterior):
    ./scripts/deploy.sh vX.Y.Z
============================================================
EOF
