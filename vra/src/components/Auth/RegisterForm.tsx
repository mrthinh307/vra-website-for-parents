import React, { useState } from "react";
import { Eye, EyeOff, X, Mail, Phone, User, HeartHandshake, KeyRound } from "lucide-react";
import AnimatedButton from "../lib-animated/Button";
import { motion, AnimatePresence } from "framer-motion";

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterFormData) => void;
}

export type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  avatar_url?: string;
};

// Hàm kiểm tra định dạng email
const isValidEmail = (email: string): boolean => {
  // General email regex + specific domain check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const domainRegex = /@(gmail\.com|edu\.vn)$/;
  return emailRegex.test(email) && domainRegex.test(email);
};

// Hàm kiểm tra định dạng số điện thoại
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

// Hàm kiểm tra độ mạnh mật khẩu
const isValidPassword = (password: string): boolean => {
  // Ví dụ: Tối thiểu 8 ký tự
  return password.length >= 6;
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    avatar_url: "",
  });

  // State để lưu trạng thái lỗi
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setRegisterData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      avatar_url: "",
    });
    setErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Kiểm tra validation
    const newErrors = {
      name: !data.name ? "Vui lòng nhập họ và tên" : data.name.length < 2 ? "Họ và tên phải có ít nhất 2 ký tự" : "",
      email: !data.email ? "Vui lòng nhập email" : !isValidEmail(data.email) ? "Email không hợp lệ hoặc không thuộc miền @gmail.com/@edu.vn" : "",
      phone: !data.phone ? "Vui lòng nhập số điện thoại" : !isValidPhone(data.phone) ? "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số" : "",
      password: !data.password ? "Vui lòng nhập mật khẩu" : !isValidPassword(data.password) ? "Mật khẩu phải có ít nhất 6 ký tự" : "",
      confirmPassword: !data.confirmPassword ? "Vui lòng xác nhận mật khẩu" : data.confirmPassword !== data.password ? "Mật khẩu và xác nhận mật khẩu phải giống nhau" : ""
    };
    
    setErrors(newErrors);
    
    // Kiểm tra xem có lỗi nào không
    if (Object.values(newErrors).some(error => error !== "")) {
      setIsLoading(false);
      return;
    }
    
    try {
      await onSubmit(data);
      resetForm();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white p-8 rounded-3xl w-[95%] max-w-[480px] relative border-4 border-primary-color shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-shadow duration-300"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </motion.button>

            <div className="text-center mb-6">
              <span className="inline-block text-primary-color font-semibold mb-1 text-sm tracking-wider uppercase">
                Tạo tài khoản mới
              </span>
              <h2 className="text-gray-900 text-2xl font-bold mb-1">
                Đăng ký tài khoản
              </h2>
              <p className="text-gray-600 text-sm">
                Tham gia cùng cộng đồng để hỗ trợ trẻ phát triển toàn diện
              </p>
            </div>
            <div className="space-y-4">
              <div className={`form-input flex items-center border-2 ${errors.name ? 'border-red-500 animate-shake' : 'border-gray-300'} rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300`}>
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên*"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}

              <div className={`form-input flex items-center border-2 ${errors.email ? 'border-red-500 animate-shake' : 'border-gray-300'} rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300`}>
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email*"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}

              <div className={`form-input flex items-center border-2 ${errors.phone ? 'border-red-500 animate-shake' : 'border-gray-300'} rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300`}>
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại*"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}

              <div className={`form-input flex items-center border-2 ${errors.password ? 'border-red-500 animate-shake' : 'border-gray-300'} rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300`}>
                <KeyRound className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu*"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}

              <div className={`form-input flex items-center border-2 ${errors.confirmPassword ? 'border-red-500 animate-shake' : 'border-gray-300'} rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300`}>
                <KeyRound className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu*"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}

              <AnimatedButton
                icon={HeartHandshake}
                text="Đăng ký"
                size="full"
                withFullWidth={true}
                primary
                isLoading={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-transform duration-300"
                onClick={() => handleRegisterSubmit(registerData)}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mt-6 text-gray-500 text-xs"
            >
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-primary-color hover:underline">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" className="text-primary-color hover:underline">
                Chính sách bảo mật
              </a>{" "}
              của chúng tôi.
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterForm;
