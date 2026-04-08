

# 🚀 E-Commerce Backend API Documentation

## 🌐 Base URL

```
https://apis-8.onrender.com
```

---

# 🔐 Authentication APIs

## 📌 Register User

```
POST /api/userRoutes/register
```

### 📥 Request Body

```json
{
  "name": "Sai Ganesh",
  "email": "sai@gmail.com",
  "password": "123456"
}
```

---

## 📌 Login User

```
POST /api/userRoutes/login
```

### 📥 Request Body

```json
{
  "email": "sai@gmail.com",
  "password": "123456"
}
```

### 📤 Response

```json
{
  "message": "login done",
  "webToken": "your_jwt_token_here"
}
```

---

## 🔑 Authentication Header (For Protected APIs)

```
Authorization: Bearer <your_token>
```

---

# 🛒 Product APIs

## 📌 Get All Products

```
GET /api/productRoutes/products
```

---

## 📌 Get Single Product

```
GET /api/productRoutes/products/:id
```

---

## 📌 Add New Product (Admin)

```
POST /api/productRoutes/products
```

### 📥 Request Type

```
multipart/form-data
```

### 📥 Fields

| Field       | Type   | Example      |
| ----------- | ------ | ------------ |
| title       | text   | iPhone       |
| description | text   | Good phone   |
| price       | number | 50000        |
| image       | file   | upload image |

---

## 📌 Update Product (Admin)

```
PUT /api/productRoutes/products/:id
```

---

## 📌 Delete Product (Admin)

```
DELETE /api/productRoutes/products/:id
```

---

# 👤 Profile APIs

## 📌 Get Profile

```
GET /api/profileRoutes/profile
```

👉 Requires token

---

## 📌 Update Profile

```
PUT /api/profileRoutes/updateprofile
```

### 📥 Request Body

```json
{
  "name": "Updated Name",
  "email": "updated@gmail.com",
  "password": "newpassword"
}
```

---

# 🛒 Cart APIs

## 📌 Get Cart

```
GET /api/cartRoutes/cart
```

---

## 📌 Add to Cart

```
POST /api/cartRoutes/addcart
```

### 📥 Request Body

```json
{
  "productId": "product_id"
}
```

---

# 💳 Payment APIs

## 📌 Checkout

```
POST /api/paymentRoutes/checkout
```

👉 No body required
👉 Uses cart data from backend

---

## 📌 Verify Payment

```
POST /api/paymentRoutes/verifypayment
```

### 📥 Request Body

```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

---

# 📦 Order APIs

## 📌 Get All Orders

```
GET /api/orderRoutes/orders
```

---

## 📌 Get Single Order

```
GET /api/orderRoutes/orders/:id
```

### 📥 Params

| Param | Description |
| ----- | ----------- |
| id    | Order ID    |

---

# 🔄 Complete Flow

```
Register → Login → Get Token → 
Browse Products → Add to Cart → 
Checkout → Payment → Verify → 
Order Created → View Orders
```

---

# ⚠️ Important Notes

* All protected routes require JWT token
* Admin access required for product management
* Payment handled using Razorpay
* Passwords are securely hashed using bcrypt

---

# 🧠 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Razorpay Integration
* Cloudinary (Image Upload)

---

# 🎯 Author

**Sai Ganesh**

---

If you want, I can next help you make this even better with:

✅ Swagger UI (interactive docs)
✅ Postman Collection
✅ Add screenshots + project explanation for resume

Just tell me 👍
