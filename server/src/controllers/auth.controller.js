const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Đăng ký với Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return res.status(400).json({ message: error.message });
    }

    // Thêm user vào bảng Supervisor
    const { error: supervisorError } = await supabase
      .from("Supervisor")
      .insert([
        {
          id: data.user.id,
          email,
          name,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (supervisorError) {
      console.error("Error creating supervisor:", supervisorError);
      return res.status(500).json({ message: "Error creating user profile" });
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        avatar_url: null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    // Đăng nhập với Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      return res.status(401).json({ message: error.message });
    }

    // Lấy thông tin user từ bảng Supervisor
    const { data: supervisor, error: supervisorError } = await supabase
      .from("Supervisor")
      .select("id, email, name, avatar_url")
      .eq("id", data.user.id)
      .single();

    if (supervisorError) {
      console.error("Error fetching supervisor:", supervisorError);
    }

    // Thiết lập cookie cho token
    const token = data.session.access_token;
    const expiresIn = 7 * 24 * 60 * 60; // 7 ngày trong giây
    
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng HTTPS trong production
      maxAge: expiresIn * 1000, // 7 ngày trong milliseconds
      sameSite: 'lax'
    });
    
    // Thêm session vào session store
    const sessionStore = require('../services/sessionStore');
    sessionStore.addSession(token, data.user.id, expiresIn);

    res.json({
      message: "Login successful",
      token: token, // Vẫn trả về token để client có thể lưu vào localStorage
      user: supervisor || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.email.split("@")[0],
        avatar_url: null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Xác thực token
exports.validateToken = async (req, res) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Token không tồn tại' });
    }
    
    // Kiểm tra xem token có trong session store không
    const sessionStore = require('../services/sessionStore');
    if (!sessionStore.isValidSession(token)) {
      return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
    }
    
    // Xác thực token với Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      // Nếu token không hợp lệ, xóa khỏi session store
      sessionStore.removeSession(token);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    
    // Lấy thông tin user từ bảng Supervisor
    const { data: supervisor, error: supervisorError } = await supabase
      .from("Supervisor")
      .select("id, email, name, avatar_url")
      .eq("id", data.user.id)
      .single();
      
    if (supervisorError) {
      console.error("Error fetching supervisor:", supervisorError);
    }
    
    res.json({
      message: 'Token hợp lệ',
      user: supervisor || {
        id: data.user.id,
        email: data.user.email,
        username: data.user.email,
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    
    if (token) {
      // Xóa session khỏi session store
      const sessionStore = require('../services/sessionStore');
      sessionStore.removeSession(token);
    }
    
    // Xóa cookie access_token
    res.clearCookie('access_token');
    
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Đăng xuất thất bại' });
  }
};
