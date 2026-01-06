// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  // لو فيه كود حالة (Status Code) محدد استخدمه، غير كده استخدم 500 (خطأ سيرفر)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // بنظهر الـ stack (مكان الخطأ بالتفصيل) فقط لو إحنا في مرحلة التطوير
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
