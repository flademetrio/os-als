#!/usr/bin/env bash
# =====================================================================
# Backup diario do banco do OS-ALS.
#
# Faz um pg_dump comprimido (.sql.gz) em /backup/os-als/postgres/,
# rotaciona arquivos mais velhos que 30 dias e loga tudo em
# /var/log/os-als/backup.log.
#
# Uso manual:
#   cd /srv/os-als && ./scripts/backup.sh
#
# Agendamento (recomendado): root crontab, 02:00 todo dia
#   sudo crontab -e
#   Cole a linha:
#       0 2 * * * cd /srv/os-als && ./scripts/backup.sh
#
# Pre-requisitos:
#   - docker-compose.prod.yml + .env.prod presentes na pasta-pai do script
#   - Postgres rodando (container osals-postgres)
#   - /backup/os-als/postgres/ writable
#   - /var/log/os-als/ writable
#
# Codigo de saida:
#   0  - backup feito
#   1  - falha (cron pega esse codigo e dispara o que estiver configurado)
# =====================================================================

set -euo pipefail

# ---------- Config ----------
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BACKUP_DIR="/backup/os-als/postgres"
LOG_FILE="/var/log/os-als/backup.log"
RETENCAO_DIAS=30

# ---------- Posiciona na pasta do projeto ----------
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")" && pwd)"
cd "$SCRIPT_DIR/.."

# ---------- Helpers ----------
log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
  echo "$msg" >> "$LOG_FILE" 2>/dev/null || true
}

get_env() {
  grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-
}

abortar() {
  log "ERRO: $1"
  [[ -n "${DUMP_FILE:-}" && -f "${DUMP_FILE:-/dev/null}" ]] && rm -f "$DUMP_FILE"
  exit 1
}

# ---------- Sanity ----------
[[ -f "$COMPOSE_FILE" ]] || abortar "$COMPOSE_FILE nao encontrado em $(pwd)"
[[ -f "$ENV_FILE"     ]] || abortar "$ENV_FILE nao encontrado em $(pwd)"

BD_USUARIO=$(get_env BD_USUARIO)
BD_NOME=$(get_env BD_NOME)
[[ -n "$BD_USUARIO" ]] || abortar "BD_USUARIO nao definido em $ENV_FILE"
[[ -n "$BD_NOME"    ]] || abortar "BD_NOME nao definido em $ENV_FILE"

mkdir -p "$BACKUP_DIR" || abortar "nao consegui criar $BACKUP_DIR"

# ---------- pg_dump ----------
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DUMP_FILE="${BACKUP_DIR}/osals-${TIMESTAMP}.sql.gz"

log "Iniciando backup -> ${DUMP_FILE}"

if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
       pg_dump -U "$BD_USUARIO" "$BD_NOME" 2>>"$LOG_FILE" | gzip > "$DUMP_FILE"; then
  abortar "pg_dump falhou (veja $LOG_FILE)"
fi

# Sanity do dump
if [[ ! -s "$DUMP_FILE" ]]; then
  abortar "dump ficou vazio"
fi

TAMANHO=$(du -h "$DUMP_FILE" | cut -f1)
log "Backup concluido: ${DUMP_FILE} (${TAMANHO})"

# ---------- Rotacao ----------
log "Rotacao: removendo dumps com mais de ${RETENCAO_DIAS} dias..."
REMOVIDOS=$(find "$BACKUP_DIR" -name 'osals-*.sql.gz' -type f -mtime +${RETENCAO_DIAS} -print -delete 2>/dev/null | wc -l)
log "${REMOVIDOS} arquivo(s) removido(s) na rotacao."

# ---------- Estatisticas ----------
TOTAL_FILES=$(find "$BACKUP_DIR" -name 'osals-*.sql.gz' -type f 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "?")
log "Estado atual: ${TOTAL_FILES} backups em $BACKUP_DIR (${TOTAL_SIZE} total)"
log "OK"
