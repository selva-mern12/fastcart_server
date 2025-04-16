# 💼 FastCart Backend

This is the backend server for **FastCart**, built with **Node.js**, **Express**, **MongoDB**, and **Cloudinary**. It handles user authentication, image uploads, and CRUD operations for product categories.

---

## 🚀 Features

- 🔐 User Signup & Login (with JWT authentication)
- 🔒 Password hashing using `bcryptjs`
- 📟 Create, Read, Update, Delete (CRUD) for categories
- ☁️ Image upload with **Multer** and **Cloudinary**
- 🛡️ Protected routes using middleware
- 🌐 CORS enabled for cross-origin support

---

## 📆 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT
- **File Uploads**: Multer + Cloudinary
- **Environment Management**: dotenv

---

## 📁 Project Structure

```
fastcart_server/
│
├── index.js              # Main server file
├── .env                  # Environment variables (not committed)
├── .gitignore            # Ignores node_modules, .env, etc.
├── package.json          # Project metadata and scripts
└── README.md             # Project documentation (this file)
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/selva-mern12/fastcart_server.git
   cd fastcart_server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the server**

   ```bash
   npm run dev
   ```

   The server runs on `http://localhost:4000` by default.

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/auth/signup` | Register new user   |
| POST   | `/api/auth/login`  | Login existing user |

### 📁 Categories (Protected with JWT)

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/categories`     | Get all categories |
| POST   | `/api/categories`     | Add new category   |
| PUT    | `/api/categories/:id` | Update a category  |
| DELETE | `/api/categories/:id` | Delete a category  |

📝 **Note**: For POST/PUT, use `multipart/form-data` to upload image files.

---

## 🔑 Token Usage

All category-related routes require a token in the header:

```
Authorization: Bearer <your_token>
```

---

## 🧰 Sample User Object

```json
{
  "name": "Selva",
  "username": "selva_1201",
  "password": "selva@1201"
}
```

---

## 🗂️ Sample Category Object

```json
{
    "category_name": "Men's Cloth",
    "item_count": 23,
    "image_url": "https://res.cloudinary.com/den8g6mcs/image/upload/v1744565107/fastcart/gj47pliczl6hq10m2jxn.png",
    "user_id": "user_id"
}
```

---

## 🩼 .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
.env
```

---

## 🧑‍💻 Author

- GitHub: [@selva-mern12](https://github.com/selva-mern12)

---

📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software as per the terms of the license.

---

