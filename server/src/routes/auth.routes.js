const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middleware/validation.middleware');

// Đăng ký
router.post('/register', validationMiddleware.validateRegister, authController.register);

// Đăng nhập
router.post('/login', validationMiddleware.validateLogin, authController.login);

module.exports = router;