const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // استدعاء مكتبة التشفير هنا

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // البيانات لازم تكون نص
      required: [true, "Please add a name"], // الحقل ده اجباري ولو اليوزر محاولش يبعت اسمه الداتا بيز هترفض وتطلع له الرسالة دي
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true, // لو فيه حاجة مكتوبة كابيتال تحولها لسمول
      trim: true, // تشيل اي مسافات فاضية
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6, // حد ادنى لطول الباسورد 6
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isAdmin: { type: Boolean, required: true, default: false }, // هنا القفلة
  },
  {
    timestamps: true, //createdAt: تاريخ وساعة تسجيل اليوزر بالظبط   ,     //updatedAt: تاريخ آخر مرة اليوزر عدل فيها بياناته
  }
);

// --- الـ pre-save hook بدأت هنا ---
userSchema.pre("save", async function (next) {
  // لو الباسورد ملمسش (مثلاً بنعدل الاسم بس) ميعملش تشفير تاني عشان الدخول ميبوظش
  if (!this.isModified("password")) {
    return next();
  }

  // تشفير الباسورد أوتوماتيكياً قبل الحفظ
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// --- الـ pre-save hook انتهت هنا ---

module.exports = mongoose.model("User", userSchema);
