const express = require("express");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const router = express.Router();

// 1. إنشاء منتج جديد (Create Product)
// شيلنا الـ try/catch واستخدمنا asyncHandler
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, price, description, category, image } = req.body;

    // ممكن هنا مستقبلاً تضيف الـ Validation بـ Joi زي ما عملنا في الـ Auth
    const product = await Product.create({
      name,
      price,
      description,
      category,
      image,
    });

    res.status(201).json(product);
  })
);

// 2. جلب المنتجات مع (Pagination + Filtering + Search)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // --- 1. بناء الأوبجيكت بتاع الفلترة ---
    const queryObj = {};

    // لو اليوزر بعت قسم معين (مثلاً ?category=electronics)
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // لو اليوزر عايز المنتجات اللي سعرها أقل من أو يساوي قيمة معينة (?maxPrice=500)
    if (req.query.maxPrice) {
      queryObj.price = { $lte: Number(req.query.maxPrice) }; // $lte تعني Less Than or Equal
    }

    // --- الجديد: البحث بالاسم (Search) ---
    if (req.query.search) {
      queryObj.name = {
        $regex: req.query.search, // بيبحث عن أي حرف موجود جوه الاسم
        $options: "i", // يجعل البحث غير حساس لحالة الأحرف (كبير/صغير)
      };
    }

    // --- 2. إعدادات الـ Pagination (اللي عملناها قبل كدة) ---
    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // --- 3. تنفيذ البحث بالفلتر الجديد ---
    const products = await Product.find(queryObj) // بنمرر queryObj هنا اللي فيه (البحث والقسم والسعر)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(queryObj); // لازم نحسب الإجمالي بناءً على الفلتر برضه
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      page,
      totalPages,
      totalProducts,
    });
  })
);
// 3. جلب منتج واحد فقط بواسطة الـ ID (Single Product)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  })
);
module.exports = router;
