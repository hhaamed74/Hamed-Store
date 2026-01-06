const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // حاول تعمل الاتصال
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Print the host name to make sure you are connected to the correct database (Local or Cloud)    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
  } catch (err) {
    console.error(`Error: ${err.message} ❌`);
    // الخروج من البرنامج لو الاتصال فشل (عشان السيرفر ميفضلش شغال ع الفاضي)
    process.exit(1);
  }
};

module.exports = connectDB;
