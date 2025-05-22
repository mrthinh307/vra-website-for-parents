const { check, validationResult } = require('express-validator');

// Middleware xác thực thông tin đăng ký
exports.validateRegister = [
  // Kiểm tra email
  check('email')
    .isEmail().withMessage('Email không hợp lệ'),
  
  // Kiểm tra mật khẩu
  check('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  // Kiểm tra tên
  check('name')
    .notEmpty().withMessage('Vui lòng nhập họ và tên'),
  
  // Kiểm tra phone (nếu có)
  check('phone')
    .optional({ nullable: true, checkFalsy: true }), // Bỏ ràng buộc về định dạng
  
  // Middleware xử lý kết quả validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware xác thực thông tin đăng nhập
exports.validateLogin = [
  // Kiểm tra email
  check('email')
    .isEmail().withMessage('Email không hợp lệ'),
  
  // Kiểm tra mật khẩu
  check('password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  
  // Middleware xử lý kết quả validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
