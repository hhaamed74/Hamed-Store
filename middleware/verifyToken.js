const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler"); // ضفنا الحارس عشان لو حصل خطأ غير متوقع

// الكود ده بيشتغل في "الخفاء" بين الريكويست وبين الـ الروت الأساسي

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization; // لما اليوزر بيبعت طلب (زي "عمل أوردر")، بيبعت التوكن في حتة اسمها هيدرز هنا بقا بنسحب القيمة بتاع الاثوريزيشن

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Access denied. No token provided.");
  }

  // التوكن دايما يبدا بكلمة بيرار وبعدها مسافة
  const token = authHeader.split(" ")[1]; // بناخد الجزء التاني (رقم 1 في المصفوفة) عشان نحصل على التوكن الصافي.

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // بيتأكد إن التوكن سليم ومش "مضروب" , بيتأكد إن التوكن لسه صالح ومش منتهي الصلاحية

    // Make sure the payload contains the data you need

    req.user = decoded; // دي أهم حركة! إحنا بنفك التوكن وبناخد الداتا اللي جواه زي الرول والايدي

    next(); // دي معناها "خلاص يا حارس، الرخصة سليمة، عدي الريكويست خليه يروح للكنترولر
  } catch (err) {
    res.status(401);
    // تمييز خطأ انتهاء صلاحية التوكن
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired, please login again");
    }
    throw new Error("Invalid or malformed token");
  }
});

module.exports = verifyToken;
