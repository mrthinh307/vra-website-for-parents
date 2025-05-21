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

    res.json({
      message: "Login successful",
      token: data.session.access_token,
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
