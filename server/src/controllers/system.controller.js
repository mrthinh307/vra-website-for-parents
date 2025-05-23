const sessionStore = require('../services/sessionStore');

exports.getSessionStatus = async (req, res) => {
  try {
    // Kiểm tra xem người dùng có quyền admin không (thêm logic tùy ứng dụng)
    // Trong môi trường thực tế, bạn sẽ muốn kiểm tra quyền admin
    
    // Lấy tất cả các session hiện tại
    const sessions = sessionStore.getAllSessions();
    
    res.json({
      activeSessions: sessions.length,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ message: 'Error getting session status' });
  }
};
