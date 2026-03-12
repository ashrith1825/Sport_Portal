# ==========================================
# Stage 1 — Build Spring Boot Application
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy Maven configuration
COPY pom.xml .

# Download dependencies first (better caching)
RUN mvn -B dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn -B clean package -DskipTests


# ==========================================
# Stage 2 — Run Application
# ==========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S sportportal && adduser -S sportportal -G sportportal

# Copy built jar
COPY --from=builder /build/target/*.jar app.jar

# Use non-root user
USER sportportal

# Expose port used by Spring Boot
EXPOSE 8080

# Start Spring Boot application
ENTRYPOINT ["java","-jar","/app/app.jar"]
