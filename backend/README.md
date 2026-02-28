# Sampath Grocery System - Backend

Spring Boot RESTful API with JWT Authentication, MySQL Database, and comprehensive grocery store management features.

## 🛠 Technology Stack

- **Framework**: Spring Boot 3.x
- **Database**: MySQL 8.x
- **Security**: JWT (JSON Web Tokens)
- **Build Tool**: Maven
- **Java Version**: 17+

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/sampathgrocery/
│   │   │   ├── SampathGroceryApplication.java
│   │   │   │
│   │   │   ├── config/              # Configuration classes
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   │
│   │   │   ├── security/            # JWT & Security components
│   │   │   │   ├── JwtAuthenticationEntryPoint.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── UserPrincipal.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── entity/              # JPA Entities
│   │   │   │   ├── auth/            # User, Role, Employee, etc.
│   │   │   │   ├── customer/        # Customer entities
│   │   │   │   ├── product/         # Product, Category, Stock
│   │   │   │   ├── order/           # Order, Cart, Payment
│   │   │   │   ├── supplier/        # Supplier, Purchase Order
│   │   │   │   └── delivery/        # Delivery, Driver, Vehicle
│   │   │   │
│   │   │   ├── repository/          # JPA Repositories
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── product/
│   │   │   │   ├── order/
│   │   │   │   ├── supplier/
│   │   │   │   └── delivery/
│   │   │   │
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── product/
│   │   │   │   ├── order/
│   │   │   │   ├── supplier/
│   │   │   │   └── delivery/
│   │   │   │
│   │   │   ├── service/             # Business Logic Layer
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── product/
│   │   │   │   ├── order/
│   │   │   │   ├── supplier/
│   │   │   │   └── delivery/
│   │   │   │
│   │   │   ├── controller/          # REST API Controllers
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── product/
│   │   │   │   ├── order/
│   │   │   │   ├── supplier/
│   │   │   │   └── delivery/
│   │   │   │
│   │   │   ├── exception/           # Exception Handling
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   │
│   │   │   └── util/                # Utility Classes
│   │   │       ├── ApiResponse.java
│   │   │       ├── AppConstants.java
│   │   │       └── CodeGenerator.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── schema.sql
│   │       └── data.sql
│   │
│   └── test/
│       └── java/com/sampathgrocery/
│
├── pom.xml
├── mvnw / mvnw.cmd
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- MySQL 8.x
- Maven 3.6+ (or use included Maven Wrapper)

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE sampath_grocery;
```

2. Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sampath_grocery
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application

Using Maven Wrapper:
```bash
./mvnw spring-boot:run
```

Or using installed Maven:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier

### Deliveries
- `GET /api/deliveries` - Get all deliveries
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/{id}/status` - Update delivery status

## 🔐 Security

The application uses JWT-based authentication. Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📦 Key Dependencies

- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- MySQL Connector
- JWT (jjwt-api, jjwt-impl, jjwt-jackson)
- Lombok
- Spring Boot Starter Validation

## 🧪 Testing

Run tests:
```bash
./mvnw test
```

## 📝 Notes

- Default admin user will be created on first run (see data.sql)
- API documentation can be accessed via Swagger UI (if configured)
- CORS is enabled for frontend integration

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Submit pull request

## 📄 License

Proprietary - Sampath Grocery System
