# Simple E-commerce Web Application

A full-stack e-commerce web application with user authentication, product management, shopping cart functionality, and order processing capabilities. Built with Spring Boot, Java, JPA/Hibernate, PostgreSQL, and vanilla JavaScript. This project showcases backend API development and frontend integration skills.

---

**[➡️ Live Demo](https://simplee-commercestore-production.up.railway.app/)** 

---

## Screenshots

![Register](https://res.cloudinary.com/drxo7i9dk/image/upload/v1747458791/register_ttenl8.png)
![Login](https://res.cloudinary.com/drxo7i9dk/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1747458790/login_a18eyo.png)
![Main](https://res.cloudinary.com/drxo7i9dk/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1747458791/main_g1xans.png)
![Product Detail](https://res.cloudinary.com/drxo7i9dk/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1747458793/product-details_nqz5oz.png)
![Cart](https://res.cloudinary.com/drxo7i9dk/image/upload/v1747458790/cart_svtd6q.png)
![Checkout](https://res.cloudinary.com/drxo7i9dk/image/upload/v1747458790/checkout_zpcsom.png)
![Order Confirmation](https://res.cloudinary.com/drxo7i9dk/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1747458790/order-confirm_lfa3hw.png)
![My Orders](https://res.cloudinary.com/drxo7i9dk/image/upload/v1747458790/order_zas8y6.png)
![Order Details](https://res.cloudinary.com/drxo7i9dk/image/upload/v1747458791/order-details_bmy8qd.png)

---

## Features

### User Management
* User registration and login
* JWT-based authentication
* Role-based access control (User/Admin roles)

### Product Management
* Admin panel for managing products
* Image upload via Cloudinary integration
* Product browsing for regular users

### Shopping Cart
* Add products to cart
* Update product quantities
* Remove products from cart
* Item selection for checkout
* Cart data persistence in localStorage

### Order Processing
* Create orders from cart items
* Comprehensive order status management (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
* View order history and details
* Order cancellation for users (when in PENDING or PROCESSING state)
* Admin-only order status updates

### Security
* Protected admin routes
* Secure API endpoints
* JWT token verification

---

## Tech Stack

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white) 
![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

## Project Architecture

### Backend Structure
```
com.dom_cheung.ecommerce_store/
├── config/                  # Configuration classes
│   ├── CloudinaryConfig.java
│   ├── SecurityConfig.java
│   └── ...
├── controller/              # REST API controllers
│   ├── AdminProductController.java
│   ├── AuthController.java
│   ├── OrderController.java
│   ├── ProductController.java
│   └── ...
├── model/                   # Entity classes
│   ├── CartItem.java
│   ├── Order.java
│   ├── OrderItem.java
│   ├── OrderStatus.java
│   ├── Product.java
│   ├── User.java
│   └── ...
├── repository/              # Data access layer
│   ├── OrderRepository.java
│   ├── ProductRepository.java
│   ├── UserRepository.java
│   └── ...
├── security/                # Security components
│   └── JwtAuthenticationFilter.java
├── service/                 # Business logic
│   ├── AuthService.java
│   ├── CloudinaryService.java
│   ├── CustomUserDetailsService.java
│   ├── OrderService.java
│   └── ...
└── EcommerceStoreApplication.java
```

### Frontend Structure
```
src/main/resources/static/
├── css/                     # Stylesheet files
├── js/                      # JavaScript files
│   ├── cart.js              # Shopping cart functionality
│   ├── common.js            # Common utility functions
│   ├── checkout.js          # Checkout process
│   └── ...
├── images/                  # Image assets
├── cart.html                # Shopping cart page
├── checkout.html            # Checkout page
├── index.html               # Product listing page
├── login.html               # Login page
├── product.html             # Product detail page
└── ...
```

---

## Setup and Run Locally

**Prerequisites:**

* **Java Development Kit (JDK):** Version 17 or higher
* **Apache Maven:** Installed and configured
* **PostgreSQL:** Running locally or accessible
* **Cloudinary Account:** For image storage (optional)
* **Git:** Installed

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nortHades/simple_e-commerce_store.git
   cd simple_e-commerce_store
   ```

2. **Database Setup:**
   * Ensure your PostgreSQL server is running
   * Create a new database:
     ```sql
     CREATE DATABASE ecommerce_db;
     ```
   * Configure the database connection in `application.properties` or `application.yml`

3. **Cloudinary Setup (for image upload functionality):**
   * Sign up for a free Cloudinary account
   * Set the `CLOUDINARY_URL` environment variable with your Cloudinary credentials

4. **Build and Run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

5. **Access the Application:**
   * Open a web browser and navigate to: `http://localhost:8080/`
   * Register for a new account to access customer features

---

## API Endpoints

### Authentication
* `POST /api/auth/register`: Register a new user
* `POST /api/auth/login`: Authenticate user and receive JWT

### Products (Public)
* `GET /api/products`: Get all products
* `GET /api/products/{id}`: Get product by ID

### Products (Admin only)
* `POST /admin/products`: Create new product
* `PUT /admin/products/{id}`: Update product
* `DELETE /admin/products/{id}`: Delete product

### Order Management
* `POST /api/orders`: Create a new order
* `GET /api/orders`: Get current user's orders
* `GET /api/orders/{orderNumber}`: Get order details
* `POST /api/orders/{orderNumber}/cancel`: Cancel an order (for users)
* `POST /api/orders/{orderNumber}/status`: Update order status (Admin only)

---

## Future Enhancements

* Inventory management system
* Payment gateway integration
* Server-side cart synchronization
* Enhanced product search and filtering
* User profile management
* Frontend framework integration (React/Vue)

---

## Author

* **Dong Zhang** - [nortHades](https://github.com/nortHades)

---
