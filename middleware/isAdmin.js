const asyncHandler = require("express-async-handler");

const isAdmin = asyncHandler(async (req, res, next) => {
  // التأكد من وجود بيانات المستخدم (تم فك التوكن بنجاح)
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized: No user data found");
  }

  // التأكد من الصلاحية (هل الرتبة أدمن؟)
  if (req.user.role !== "admin") {
    res.status(403); // كود 403 يعني "ممنوع" (أنت مسجل دخول بس ملكش صلاحية هنا)
    throw new Error("Access denied: Admins only");
  }

  next(); // الرتبة تمام، اتفضل عدي
});

module.exports = isAdmin;
