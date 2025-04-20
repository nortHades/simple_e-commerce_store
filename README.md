# Simple E-commerce Web Application

A full-stack web application demonstrating product browsing and a client-side shopping cart, built with Spring Boot, Java, JPA/Hibernate, MySQL, and vanilla JavaScript. This project serves as a portfolio piece showcasing core backend API development and frontend integration skills.

---

**[➡️ Live Demo (Link Placeholder)]** **(Optional: Add a link here once your application is deployed!)**

---

## Screenshots / Demo GIF

**(Highly Recommended: Insert screenshots or an animated GIF here!)**

* Show the product list page.
* Show the product detail page.
* Show the shopping cart page.
* (Optional GIF: Show adding items, viewing cart, updating quantity, removing items).

*Example Markdown for image:* `![Product List Screenshot](path/to/your/screenshot.png)` 

---

## Features

* **Backend API:**
    * RESTful API built with Spring Boot (Java).
    * CRUD (Create, Read, Update, Delete) operations for Products.
    * Uses Spring Data JPA and Hibernate for database interaction.
    * Connected to a MySQL database.
* **Frontend:**
    * Displays a list of products fetched from the backend API.
    * Displays detailed information for a single product.
    * Client-side shopping cart implemented using browser `localStorage`.
    * Add items to the cart.
    * View cart items and total price.
    * Update item quantity in the cart.
    * Remove items from the cart.
* **Development:**
    * Built using Maven.
    * Version controlled with Git and hosted on GitHub.

---

## Tech Stack

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white) 
![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) 
---

## Setup and Run Locally

Follow these steps to get the application running on your local machine.

**Prerequisites:**

* **Java Development Kit (JDK):** Version 17 or 21 installed.
* **Apache Maven:** Installed and configured. 
* **MySQL Server:** Running locally or accessible. 
* **Git:** Installed.

**Steps:**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/]https://github.com/nortHades/simple_e-commerce_store.git
    cd simple_e-commerce_store
    ```

2.  **Database Setup:**
    * Ensure your MySQL server is running.
    * Connect to MySQL using a client (e.g., MySQL Workbench, DBeaver, `mysql` command line).
    * Create the database (if it doesn't exist):
        ```sql
        CREATE DATABASE simple_ecommerce_db; 
        ```
        *(Use the name you configured in `application.properties`, e.g., `simple_ecommerce_db`)*
    * Open the `src/main/resources/application.properties` file.
    * Verify/update the `spring.datasource.url`, `spring.datasource.username`, and `spring.datasource.password` properties to match your local MySQL setup.

3.  **Build the Project:**
    * Open a terminal or command prompt in the project's root directory.
    * Run the Maven build command:
        ```bash
        mvn clean install 
        ```
       *(This compiles the code and downloads dependencies)*

4.  **Run the Application:**
    * You can run the application using Maven:
        ```bash
        mvn spring-boot:run
        ```
    * Alternatively, you can run the main application class (`EcommerceStoreApplication.java`) directly from your IDE (like IntelliJ IDEA).

5.  **Access the Application:**
    * Once the application starts successfully (look for `Tomcat started on port(s): 8080`), open your web browser and navigate to:
        `http://localhost:8080/`

---

## API Endpoints (Optional)

The backend provides the following RESTful API endpoints for managing products:

* `POST /api/products`: Creates a new product. (Requires JSON body)
* `GET /api/products`: Retrieves a list of all products.
* `GET /api/products/{id}`: Retrieves a single product by its ID.
* `PUT /api/products/{id}`: Updates an existing product by its ID. (Requires JSON body)
* `DELETE /api/products/{id}`: Deletes a product by its ID.

---

## Author

* **Dong Zhang** - [Your GitHub Profile Link (e.g., https://github.com/nortHades)]

---
