# 🛒 E-Commerce API

A beginner-friendly RESTful E-Commerce Backend API built with **Node.js**, **Express.js**, and **MongoDB**. This project demonstrates authentication, authorization, product management, shopping cart functionality, image uploads, and secure API development without any frontend.

## 🚀 Features

* 🔐 JWT Authentication
* 👤 User Registration & Login
* 🛡️ Role-Based Authorization (Admin / Customer)
* 📦 Product CRUD Operations
* 🛒 Shopping Cart System
* 🗄️ MongoDB with Mongoose
* 🔒 Password Hashing with bcrypt
* 📄 RESTful API Design
*  Forgot Password
* ❌ Proper Error Handling

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (jsonwebtoken)
* bcryptjs
* dotenv

## 📁 Project Structure

```text
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── config/
├── server.js
└── package.json
```

## 📌 API Modules

### Authentication

* Register User
* Login User
* JWT Token Generation

### Products

* Add Product (Admin)
* Get All Products
* Get Single Product
* Update Product (Admin)
* Delete Product (Admin)

### Cart

* Add to Cart
* Remove from Cart
* Update Quantity
* View Cart

## 📚 What I Learned

* Building REST APIs
* MongoDB Relationships
* JWT Authentication
* Role-Based Access Control
* Middleware in Express
* Mongoose Schemas & Models
* API Testing with Postman
* Project Structure & Clean Code

## ⚙️ Installation

```bash
git clone https://github.com/Lavish09-Mehra/E-Commerce-API.git

cd E-Commerce-API

npm install

npm start
```

Create a `.env` file and add your credentials:

```env
MONGO_URL=your_mongodb_connection
JWT_SECRET=your_secret
```

## 🧪 Testing

Use **Postman** or any API client to test the endpoints.

## 🤖 AI Usage

This project is primarily my own work.

* Approximately **80%** of the codebase was written by me from scratch.
* Around **20%** was created with assistance from ChatGPT for learning and guidance.
* The **`cart.js`** implementation contains the largest amount of AI-assisted code, while nearly all other routes, middleware, models, and project files were handwritten by me.

I used AI as a learning tool to understand concepts and improve implementation rather than simply generating the complete project.

## 👨‍💻 Author

**Lavish Mehra**

Learning Backend Development with Node.js, Express, MongoDB, and REST APIs.
