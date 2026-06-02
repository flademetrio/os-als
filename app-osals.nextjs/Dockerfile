# =====================================================================
# Dockerfile multi-stage do app-osals.nextjs.
# Stage 1: deps  - instala node_modules com lockfile
# Stage 2: build - gera .next/standalone via Next 16
# Stage 3: runtime - apenas o standalone, sem deps de build
# =====================================================================

# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

# ---------- Stage 2: build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Stage 3: runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Usuario nao-root (boas praticas)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Confirma que o Next responde. Usa /login (rota publica) em vez de /
# porque "/" redireciona para /login (307) e o wget --spider do busybox
# trata redirect como erro — marcaria o container unhealthy mesmo
# funcionando. Tambem aumenta start-period para 45s — Next 16 com
# standalone leva ~40s para responder no primeiro hit.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/login || exit 1

CMD ["node", "server.js"]
