const express = require("express");
const cors = require("cors");
require("dotenv").config();
const errorHandler = require("./middleware/errorMiddleware");
require("./models/User");
require("./models/Product");
require("./models/Order");
// استدعاء الـ Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const resetRoutes = require("./routes/reset");

const app = express();

// 1. Middlewares الأساسية (بوابة الدخول)
app.use(cors());
app.use(express.json());

// 2. ربط الروتس (منطقة العمليات)
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/reset", resetRoutes);

// روت تجريبي
app.get("/", (req, res) => {
  res.send("Store API is running... 🚀");
});

// 3. التعامل مع الروتس اللي مش موجودة (التايهين)
app.use((req, res, next) => {
  res.status(404);
  next(new Error("Route not found")); // بنبعت الخطأ للـ errorHandler
});

// 4. الحارس العالمي للأخطاء (لازم يكون آخخر سطر قبل الـ module.exports)
app.use(errorHandler);

module.exports = app;
