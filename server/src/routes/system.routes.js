const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Lấy thông tin về session (có thể bổ sung middleware kiểm tra admin trong môi trường thực tế)
router.get('/sessions', authMiddleware, systemController.getSessionStatus);

module.exports = router;
