const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    // Xác thực token với Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    
    // Gán thông tin user cho request
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;