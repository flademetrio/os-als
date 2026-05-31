# =====================================================================
# Dockerfile multi-stage do api-osals.
# Stage 1: build com Maven (JDK 21)
# Stage 2: runtime apenas com JRE 21, usuario nao-root, healthcheck
# =====================================================================

# ---------- Stage 1: build ----------
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copia primeiro os arquivos do Maven para aproveitar cache de dependencias
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copia o codigo e gera o jar
COPY src src
RUN ./mvnw package -DskipTests -B

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# curl para o HEALTHCHECK (a base alpine nao tem por padrao)
RUN apk add --no-cache curl

# Usuario nao-root com UID/GID 10001 — combina com o usuario "osals" do
# host de producao, para o bind mount de /var/os-als/anexos funcionar
# sem precisar de chown depois.
RUN addgroup -S -g 10001 osals \
 && adduser  -S -u 10001 -G osals osals

# Copia o jar compilado
COPY --from=build --chown=osals:osals /app/target/*.jar app.jar

# Diretorios padrao montados como volume (criados se nao existirem)
RUN mkdir -p /var/os-als/anexos /var/log/os-als \
 && chown -R osals:osals /var/os-als /var/log/os-als

USER osals

EXPOSE 8080

# Spring Boot Actuator (configurado em application.yml: expose=health,info)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
