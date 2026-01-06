const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); // الحارس من try/catch
const router = express.Router();

// ================== REGISTER USER ==================
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // 1. التأكد إن اليوزر مش موجود (ممكن تستخدم Joi هنا كمان لو حبيت)
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // 2. تشفير الباسورد (ممكن تعملها في الموديل كـ Middleware بس هنا برضه تمام)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. حفظ اليوزر
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    // 4. إرسال البيانات (استخدمنا .select() في الـ Schema أو يدوي هنا)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  })
);

// ================== GET ALL USERS ==================
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // نضافة تامة: بنجيب كله ما عدا الباسورد ونرتب بالأحدث
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  })
);

module.exports = router;
