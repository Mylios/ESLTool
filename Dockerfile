# ---- Base image with Java ----
FROM eclipse-temurin:25-jdk-alpine

# Install Node.js
RUN apk add --no-cache nodejs npm

WORKDIR /app

# ---- Copy Spring app ----
COPY src /app/src
COPY pom.xml /app/

# Install Maven
RUN apk add --no-cache maven

# Build Spring Boot app
RUN mvn clean package -DskipTests

# ---- Copy Node site ----
COPY site /app/site

WORKDIR /app/site
RUN npm install

# Go back to root
WORKDIR /app

# Expose Render dynamic port
EXPOSE 8080

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]