const app = require("./app");
const connectDB = require("./config/db");

// 1. الربط بالداتابيز قبل تشغيل السيرفر
connectDB();

// 2. استخدام بورت متغير أو 3000 كاحتياطي
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
  console.log("Press Ctrl+C to stop the server");
});
