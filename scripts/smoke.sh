#!/usr/bin/env bash
# =====================================================================
# Smoke test do OS-ALS — sobe postgres + backend via Docker Compose,
# espera o healthcheck, faz login com o admin seed e lista clientes.
#
# Uso:
#   scripts/smoke.sh           sobe o compose, testa e DEIXA no ar
#   scripts/smoke.sh --down    ao final, derruba o compose
#
# Pre-requisitos: Docker, curl. As chaves RSA do JWT sao geradas em
# api-osals.java/keys/ se ainda nao existirem.
# =====================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

API="http://localhost:8080"
EMAIL="flavio@alsindustria.com.br"
SENHA="123"
COOKIES="$(mktemp)"
DERRUBAR=false
[ "${1:-}" = "--down" ] && DERRUBAR=true

falhar() { echo "FALHA: $*" >&2; exit 1; }

# --- 1. Chaves RSA do JWT ---
KEYS="api-osals.java/keys"
if [ ! -f "$KEYS/chave-privada.pem" ]; then
  echo "==> Gerando chaves RSA do JWT em $KEYS/"
  mkdir -p "$KEYS"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$KEYS/chave-privada.pem"
  openssl rsa -pubout -in "$KEYS/chave-privada.pem" -out "$KEYS/chave-publica.pem"
fi

# --- 2. Subir o compose (postgres + backend) ---
echo "==> Subindo postgres + backend (docker compose up -d --build)"
docker compose up -d --build postgres backend

# --- 3. Esperar o healthcheck do backend ---
echo "==> Aguardando o backend responder em $API/actuator/health"
for i in $(seq 1 60); do
  if curl -fs "$API/actuator/health" >/dev/null 2>&1; then
    echo "    backend no ar (${i}x5s)"
    break
  fi
  [ "$i" -eq 60 ] && falhar "backend nao respondeu em 5 minutos"
  sleep 5
done

# --- 4. Login com o admin seed ---
echo "==> Login: $EMAIL"
http=$(curl -s -o /dev/null -w "%{http_code}" -c "$COOKIES" \
  -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}")
[ "$http" = "200" ] || falhar "login retornou HTTP $http (esperado 200)"
echo "    login OK"

# --- 5. Listar clientes (endpoint autenticado) ---
echo "==> GET /clientes"
http=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIES" "$API/clientes")
[ "$http" = "200" ] || falhar "GET /clientes retornou HTTP $http (esperado 200)"
echo "    listagem de clientes OK"

rm -f "$COOKIES"
echo
echo "SMOKE TEST PASSOU."

if $DERRUBAR; then
  echo "==> Derrubando o compose (--down)"
  docker compose down
fi
