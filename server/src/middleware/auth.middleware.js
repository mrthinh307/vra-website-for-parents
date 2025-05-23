const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const sessionStore = require('../services/sessionStore');

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    // Kiểm tra xem token có trong session store không
    // Điều này đảm bảo khi server khởi động lại, các token cũ sẽ không còn hiệu lực
    if (!sessionStore.isValidSession(token)) {
      return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
    }

    // Xác thực token với Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      // Nếu token không hợp lệ, xóa khỏi session store
      sessionStore.removeSession(token);
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