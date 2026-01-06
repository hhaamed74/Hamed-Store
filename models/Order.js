const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        // السعر وقت ما اليوزر داس "اتمام الطلب"
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true, // خليه إجباري لضمان دقة البيانات
    },
    shippingAddress: {
      street: String,
      city: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
