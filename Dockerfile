# Step 1: Base Image - Choose the Java version your project needs
FROM eclipse-temurin:21-jdk as builder

# Step 2: Set Working Directory inside the container
WORKDIR /app

# Step 3: Copy Maven Wrapper & POM file first for dependency caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Step 4: Download dependencies using the Maven Wrapper
RUN ./mvnw dependency:go-offline -B

# Step 5: Copy the rest of your application source code
COPY src ./src

# Step 6: Build the application JAR using the Maven Wrapper
RUN ./mvnw package -DskipTests

# Step 7: Prepare the final, smaller runtime image
FROM eclipse-temurin:21-jre

WORKDIR /app

# Step 8: Copy ONLY the built JAR file from the 'builder' stage
COPY --from=builder /app/target/ecommerce-store-0.0.1-SNAPSHOT.jar app.jar

# Step 9: Expose the port the application will run on
EXPOSE 10000

# Step 10: Command to run the application when the container starts
CMD ["java", "-jar", "app.jar"]