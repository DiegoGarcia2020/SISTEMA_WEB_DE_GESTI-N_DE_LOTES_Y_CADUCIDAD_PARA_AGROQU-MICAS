# ── Etapa de build: compila con Maven + JDK 21 ──────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

# ── Etapa de runtime: solo el JRE, sin Maven ni codigo fuente ─
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S sacpa && adduser -S sacpa -G sacpa
COPY --from=build /app/target/*.jar app.jar
USER sacpa
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
