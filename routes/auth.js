const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs"); // بنحتاجه فقط في اللوجن للمقارنة

// --- دالة التحقق من بيانات التسجيل ---
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      "string.min": "الاسم لازم يكون 3 حروف على الأقل",
      "any.required": "الاسم حقل إجباري",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "يرجى كتابة إيميل صحيح",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "الباسورد ضعيف، خليه أكتر من 6 حروف",
    }),
    role: Joi.string().valid("user", "admin"), // ضفنا السطر ده عشان Joi يوافق عليه
  });
  return schema.validate(data);
};

// --- دالة التحقق من بيانات الدخول ---
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "الايميل غلط",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "الباسورد غلط",
    }),
  });
  return schema.validate(data);
};

// ================== REGISTER ==================
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    // 1. فحص البيانات
    const { error } = validateRegister(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // 2. التأكد من عدم وجود المستخدم
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // 3. حفظ المستخدم (التشفير هيحصل أوتوماتيك في الموديل بفضل الـ Pre-save Hook)
    const newUser = await User.create({
      name,
      email: cleanEmail,
      password, // بنبعته "صافي" والموديل بيقوم بالواجب
    });

    res.status(201).json({ message: "User created successfully ✅" });
  })
);

// ================== LOGIN ==================
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // 1. ابحث عن اليوزر
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // 2. مقارنة الباسورد (بناخد الباسورد من الريكويست ونقارنه باللي في الداتابيز)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // 3. توقيع التوكن
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ضروري جداً تبعت الـ role هنا
      },
    });
  })
);

module.exports = router;
