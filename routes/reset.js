// routes/reset.js
const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

// كود غير امن ومستحيل نعمله في مشاريع كبير عشان مش عليه اي حمايه

// DELETE all data (temporary, admin only)
router.delete("/all", async (req, res) => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    res.json({ message: "Database cleared ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
