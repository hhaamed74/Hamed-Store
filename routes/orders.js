const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler"); // ضفنا دي

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// ================== CREATE ORDER ==================
router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { products } = req.body;
    const userId = req.user.id;

    // 1. التحقق من وجود المستخدم
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // 2. التحقق من وجود المنتجات وحساب السعر
    const productIds = products.map((p) => p.productId);
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    if (existingProducts.length !== products.length) {
      res.status(404);
      throw new Error("One or more products not found");
    }

    let total = 0;
    const orderProducts = products.map((item) => {
      const product = existingProducts.find(
        (p) => p._id.toString() === item.productId
      );

      total += product.price * item.qty;

      return {
        productId: item.productId,
        qty: item.qty,
        priceAtPurchase: product.price,
      };
    });

    // 3. إنشاء الأوردر
    const order = await Order.create({
      userId,
      products: orderProducts,
      total,
      status: "pending",
    });

    res.status(201).json(order);
  })
);

// ================== GET MY ORDERS ==================
router.get(
  "/my-orders",
  verifyToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // استخدمنا populate عشان نجيب تفاصيل اليوزر والمنتج بدل مجرد IDs
    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .populate("products.productId", "name price");
    res.json(orders);
  })
);

// ================== GET ALL ORDERS (Admin) ==================
router.get(
  "/",
  verifyToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("products.productId", "name price");
    res.json(orders);
  })
);

// ================== UPDATE ORDER STATUS (Admin) ==================
router.patch(
  "/:id/status",
  verifyToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["pending", "paid", "shipped", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status value");
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    res.json(order);
  })
);

// ================== RESET DATABASE (Admin) ==================
router.delete(
  "/reset",
  verifyToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    res.json({ message: "Database reset done ✅" });
  })
);

module.exports = router;
