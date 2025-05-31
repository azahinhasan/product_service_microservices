# Getting Started

## Technology

- Nest js
- Typescript
- MongoDB
- Mongoose
- RebbitMQ
- Docker

---

## Running the Project

### Option 1: Run with Docker (Recommended)
Navigate to the project folder and run the following command(make sure docker is running on the system):
```bash
docker-compose up --build
```
or
```bash
docker compose up --build
```
Docker will handle all dependencies, including PostgreSQL and Node.js, making setup simpler.

- The auth service will be accessible at `http://localhost:5015/api/v1`.
- The product service will be accessible at `http://localhost:5016/api/v1`.
- The rabbitmq will be accessible at `http://localhost:5672`.


### Option 2: Run without Docker
Ensure the following are installed:
- **Node.js** (version 18)

#### Steps
1. **Run rebbit mq**
    - If RabbitMQ is already installed on your system, start it and ensure it's accessible. Then, update the `.env.development` files in both the Product and Auth services to connect to it.
    - Otherwise, in the root of this project, run the following command to start RabbitMQ using Docker: `docker compose up rabbitmq --build`
2. **Auth service**
    - Navigate to the `auth-service` folder.
    - Can modify configuration from `configs/.env.development`
    - Install dependencies and set up the database:
      ```bash
      npm install
      npm run dev
      ```
      This will configure the database and seed it with some dummy data. The backend server will be accessible at `http://localhost:5015`.
3. **Product service**
    - Navigate to the `product-service` folder.
    - Can modify configuration from `configs/.env.development`
    - Install dependencies and set up the database:
      ```bash
      npm install
      npm run dev
      ```
      This will configure the database and seed it with some dummy data. The backend server will be accessible at `http://localhost:5016`.
4. **Database**
    - Already connected to a MongoDB server; you can replace the connection string by updating it in the `.env.development` file.
---
---
---
---
# API Documentation

## Auth Service API

### 1. **Signup (Register User)**  
**Method**: `POST`  
**Auth**: ❌ Authorization not required  
**Endpoint**: `/auth/signup`

#### Request Body:

```json
{
  "name": "John Doe",
  "email": "john_590@example.com",
  "password": "secret123"
}
```

> Emits a `user.created` event to the USER_SERVICE upon successful registration.


### 2. **Signin (Login User)**  
**Method**: `POST`  
**Auth**: ❌ Authorization not required  
**Endpoint**: `/auth/signin`

#### Request Body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

> Return the refresh token and access token.

### 3. **Signout (Logout User)**  
**Method**: `POST`  
**Auth**: ✅ Authorization required  
**Endpoint**: `/auth/signout`

#### Request Body:

```json
{
  "userId": "66480fa42a0485273ebd4fc7"
}
```

> Deletes the stored refresh token associated with the user.

### 4. **Refresh Access Token**  
**Method**: `POST`  
**Auth**: ❌ Authorization not required  
**Endpoint**: `/auth/refresh`

#### Request Body:

```json
{
  "userId": "66480fa42a0485273ebd4fc7",
  "refreshToken": "JWT_REFRESH_TOKEN"
}
```

> Validates stored refresh token and issues a new access token.

### 5. **Verify Token**  
**Method**: `POST`  
**Auth**: ❌ Authorization not required  
**Endpoint**: `/auth/verify-token`

#### Request Body:

```json
{
  "token": "JWT_ACCESS_TOKEN"
}
```

> Returns the decoded payload if token is valid and not expired.


## Product Service API

Note: All endpoints require authorization via a valid JWT `authorization: Bearer access_token`. The access token is returned in the response after a successful login.

### 1. **Create Product**  
**Method**: `POST`  
**Auth**: ✅ Authorization required  
**Endpoint**: `/products`

#### Request Body:
```json
{
  "name": "Product A",
  "description": "Description for Product A",
  "price": 99.99,
  "createdBy": "userId123"
}
```

### 2. **Get All Products**  
**Method**: `GET`  
**Auth**: ✅ Authorization required  
**Endpoint**: `/products`

### 3. **Get Product by ID**  
**Method**: `GET`  
**Auth**: ✅ Authorization required  
**Endpoint**: `/products/:id`

### 4. **Update Product**  
**Method**: `PUT`  
**Auth**: ✅ Authorization required
**Endpoint**: `/products`

#### Request Body:
```json
{
  "id": "productId123",
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 119.99
}
```

> Only the product creator can update a product.

### 5. **Delete Product**  
**Method**: `DELETE`  
**Auth**: ✅ Authorization required 
**Endpoint**: `/products/:id`

> Only the product creator can delete a product.
