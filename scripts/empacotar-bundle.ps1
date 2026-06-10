# =====================================================================
# Empacota uma release do OS-ALS num "bundle" portatil para levar via
# pen drive / rede para outra maquina Windows com Docker.
#
# Uso:
#   ./scripts/empacotar-bundle.ps1 1.0.0
#
# Pre-requisitos:
#   - As imagens v1.0.0 ja existem localmente (release.sh rodou OK,
#     OU voce fez "docker pull").
#   - As envs e chaves do dev existem em:
#       api-osals.java/.env
#       api-osals.java/keys/{chave-privada,chave-publica}.pem
#       app-osals.nextjs/.env.local
#       app-osals.nextjs/keys/chave-publica.pem
#
# Gera uma pasta `bundle-vX.Y.Z/` na raiz do projeto com tudo dentro.
# Voce copia essa pasta para o pen drive e leva para a outra maquina.
# =====================================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$Versao
)

$ErrorActionPreference = 'Stop'

# ---------- Validacao ----------
if ($Versao -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "Erro: versao deve seguir o formato X.Y.Z (ex.: 1.0.0)" -ForegroundColor Red
    exit 1
}

$Tag = "v$Versao"
$RepoRoot = (Resolve-Path "$PSScriptRoot/..").Path
Set-Location $RepoRoot

$ImgApi = "ghcr.io/flademetrio/osals-api:$Tag"
$ImgApp = "ghcr.io/flademetrio/osals-app:$Tag"
# Pasta de saida nomeada por versao (ex.: versao-v1.4.0). O deploy.ps1 procura
# tanto "versao-vX.Y.Z" quanto o antigo "bundle-vX.Y.Z".
$BundleDir = "versao-$Tag"

# ---------- Checar imagens locais ----------
Write-Host "==> Verificando imagens locais..."
docker image inspect $ImgApi *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro: imagem $ImgApi nao existe localmente." -ForegroundColor Red
    Write-Host "      Rode antes: ./scripts/release.sh $Versao  (ou docker pull $ImgApi)" -ForegroundColor Yellow
    exit 1
}
docker image inspect $ImgApp *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro: imagem $ImgApp nao existe localmente." -ForegroundColor Red
    Write-Host "      Rode antes: ./scripts/release.sh $Versao  (ou docker pull $ImgApp)" -ForegroundColor Yellow
    exit 1
}

# ---------- Checar arquivos de config e chaves ----------
$arquivosObrigatorios = @(
    "api-osals.java/.env",
    "api-osals.java/keys/chave-privada.pem",
    "api-osals.java/keys/chave-publica.pem",
    "app-osals.nextjs/.env.local",
    "app-osals.nextjs/keys/chave-publica.pem"
)
foreach ($f in $arquivosObrigatorios) {
    if (-not (Test-Path $f)) {
        Write-Host "Erro: $f nao existe - necessario para o bundle." -ForegroundColor Red
        exit 1
    }
}

# ---------- Limpar bundle anterior ----------
if (Test-Path $BundleDir) {
    Write-Host "==> Removendo $BundleDir anterior..."
    Remove-Item -Recurse -Force $BundleDir
}

Write-Host "==> Criando $BundleDir/..."
New-Item -ItemType Directory -Path $BundleDir | Out-Null
New-Item -ItemType Directory -Path "$BundleDir/api-osals.java/keys" -Force | Out-Null
New-Item -ItemType Directory -Path "$BundleDir/app-osals.nextjs/keys" -Force | Out-Null

# ---------- Salvar imagens ----------
Write-Host "==> Salvando $ImgApi (pode demorar alguns minutos)..."
docker save $ImgApi -o "$BundleDir/osals-api-$Tag.tar"
Write-Host "==> Salvando $ImgApp..."
docker save $ImgApp -o "$BundleDir/osals-app-$Tag.tar"

# ---------- Copiar configs e chaves ----------
Write-Host "==> Copiando compose, envs e chaves..."
Copy-Item "docker-compose.smoke.yml"               "$BundleDir/docker-compose.yml"
Copy-Item "api-osals.java/.env"                    "$BundleDir/api-osals.java/.env"
Copy-Item "app-osals.nextjs/.env.local"            "$BundleDir/app-osals.nextjs/.env.local"
Copy-Item "api-osals.java/keys/*.pem"              "$BundleDir/api-osals.java/keys/"
Copy-Item "app-osals.nextjs/keys/*.pem"            "$BundleDir/app-osals.nextjs/keys/"

# ---------- LEIA-ME ----------
# (sem here-string para evitar parse issue do PowerShell 5.1 com LF line endings)
$leiame = @(
    "# OS-ALS - Bundle $Tag",
    "",
    "Pacote portatil para rodar o OS-ALS numa maquina com Docker, sem",
    "precisar de login em registry ou clonar o repositorio. So precisa",
    "de internet pra puxar o postgres oficial na primeira vez.",
    "",
    "## Como rodar (na maquina destino)",
    "",
    "1. Copie esta pasta para qualquer lugar (ex.: C:\\os-als\\).",
    "",
    "2. Abra o PowerShell nessa pasta.",
    "",
    "3. Importe as duas imagens:",
    "",
    "       docker load -i osals-api-$Tag.tar",
    "       docker load -i osals-app-$Tag.tar",
    "",
    "4. Suba o sistema:",
    "",
    "       docker compose up -d",
    "",
    "5. Acesse:",
    "",
    "   - Frontend: http://localhost:3000",
    "   - API:      http://localhost:8080",
    "",
    "Login: ver as variaveis BOOTSTRAP_ADMIN_* em api-osals.java/.env",
    "",
    "## Comandos do dia a dia",
    "",
    "    docker compose ps                     # status",
    "    docker compose logs -f                # logs em tempo real",
    "    docker compose down                   # parar (mantem dados)",
    "    docker compose down -v                # parar e zerar o banco",
    "",
    "## Atualizacao para uma versao nova",
    "",
    "A versao a rodar e definida pelas tags ghcr.io/flademetrio/osals-api:$Tag",
    "e :osals-app:$Tag. Para subir outra versao, peca o bundle correspondente",
    "(ex.: bundle-v1.0.1/) e repita os passos 3 e 4."
) -join "`r`n"

$leiame | Set-Content -Path "$BundleDir/LEIA-ME.md" -Encoding UTF8

# ---------- Resumo ----------
$tamanho = (Get-ChildItem -Recurse $BundleDir | Measure-Object -Property Length -Sum).Sum
$tamanhoMB = "{0:N1}" -f ($tamanho / 1MB)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  OK  Versao $Tag empacotada em ./$BundleDir/" -ForegroundColor Green
Write-Host "  Tamanho total: $tamanhoMB MB" -ForegroundColor Green
Write-Host ""
Write-Host "  Proximo passo:" -ForegroundColor Green
Write-Host "    1. Copiar a pasta ./$BundleDir/ inteira para o pen drive." -ForegroundColor Green
Write-Host "    2. Na maquina destino, abrir o LEIA-ME.md do bundle." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
