# ETAPA 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Copiamos solo los archivos necesarios para resolver dependencias
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 2. Damos permisos y descargamos las dependencias (Esta capa se guardará en caché)
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# 3. Ahora copiamos el código fuente y compilamos
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ETAPA 2: Imagen final (Runtime)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
