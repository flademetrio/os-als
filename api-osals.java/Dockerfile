# =====================================================================
# Dockerfile multi-stage do api-osals.
# Stage 1: build com Maven
# Stage 2: runtime apenas com JRE 17
# =====================================================================

# ---------- Stage 1: build ----------
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copia primeiro os arquivos do Maven para aproveitar cache de dependencias
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copia o codigo e gera o jar
COPY src src
RUN ./mvnw package -DskipTests -B

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia o jar compilado
COPY --from=build /app/target/*.jar app.jar

# Diretorios padrao montados como volume (criados se nao existirem)
RUN mkdir -p /var/os-als/anexos /var/log/os-als

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
