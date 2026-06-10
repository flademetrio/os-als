#!/usr/bin/env bash
# =====================================================================
# Build + tag + push das imagens do OS-ALS para o GHCR.
#
# Uso:
#   ./scripts/release.sh 1.0.0
#
# Pre-requisitos (1x na sua maquina):
#   - PAT do GitHub com escopo "write:packages"
#   - docker login ghcr.io -u flademetrio    (cola o PAT como senha)
#   - Working tree limpo (sem alteracoes nao commitadas)
#
# O que o script faz:
#   1. Valida o formato da versao (semver X.Y.Z)
#   2. Confere working tree limpo
#   3. Builda a API e o App
#   4. Aplica duas tags em cada imagem: vX.Y.Z e latest
#   5. Faz push das 4 tags pro GHCR
#   6. Cria a tag git vX.Y.Z (se ainda nao existir) e faz push
#
# Roda em Linux/macOS nativo e no Windows via Git Bash ou WSL.
# =====================================================================

set -euo pipefail

# ---------- Config ----------
GHCR_OWNER="flademetrio"
IMG_API="ghcr.io/${GHCR_OWNER}/osals-api"
IMG_APP="ghcr.io/${GHCR_OWNER}/osals-app"

# ---------- Args ----------
if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <versao>" >&2
  echo "Exemplo: $0 1.0.0" >&2
  exit 1
fi

VERSAO="$1"

if ! [[ "$VERSAO" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Erro: versao deve seguir o formato semver X.Y.Z (ex.: 1.0.0)." >&2
  exit 1
fi

TAG="v${VERSAO}"

# ---------- Repo root ----------
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

# ---------- Sanity checks ----------
if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: 'docker' nao esta no PATH." >&2
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "Erro: working tree tem alteracoes nao commitadas." >&2
  echo "       Commit ou stash antes de gerar a release." >&2
  echo
  git status --short
  exit 1
fi

echo "==> Release ${TAG}"
echo "    Owner GHCR: ${GHCR_OWNER}"
echo "    Imagens:    ${IMG_API}, ${IMG_APP}"
echo
echo "Pre-requisito: estar logado no GHCR (docker login ghcr.io)."
echo

# ---------- Build API ----------
echo "==> Build da API..."
docker build \
  --tag "${IMG_API}:${TAG}" \
  --tag "${IMG_API}:latest" \
  ./api-osals.java

# ---------- Build App ----------
echo "==> Build do App..."
docker build \
  --build-arg "VERSAO=${TAG}" \
  --tag "${IMG_APP}:${TAG}" \
  --tag "${IMG_APP}:latest" \
  ./app-osals.nextjs

# ---------- Push (com retry — o GHCR costuma falhar no primeiro push
# de um pacote novo com "error from registry: unknown") ----------
push_retry() {
  local img="$1"
  local tentativas=3
  local pausa=2
  local n
  for n in $(seq 1 $tentativas); do
    if docker push "$img"; then
      return 0
    fi
    if [[ $n -lt $tentativas ]]; then
      echo "    push de ${img} falhou (tentativa ${n}/${tentativas}), aguardando ${pausa}s e tentando de novo..."
      sleep "$pausa"
    fi
  done
  echo "Erro: push de ${img} falhou apos ${tentativas} tentativas." >&2
  return 1
}

echo "==> Push das 4 tags para o GHCR..."
push_retry "${IMG_API}:${TAG}"
push_retry "${IMG_API}:latest"
push_retry "${IMG_APP}:${TAG}"
push_retry "${IMG_APP}:latest"

# ---------- Git tag ----------
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "==> Tag git ${TAG} ja existe — pulando."
else
  echo "==> Criando tag git ${TAG}..."
  git tag -a "$TAG" -m "Release ${TAG}"
  git push origin "$TAG"
fi

cat <<EOF

============================================================
  OK  Release ${TAG} disponivel no GHCR.

  Para deployar na producao:
    1. SSH no servidor.
    2. cd /srv/os-als
    3. Editar .env.prod: OSALS_VERSAO=${TAG}
    4. ./scripts/deploy.sh   (ou compose pull + up -d)
============================================================
EOF
