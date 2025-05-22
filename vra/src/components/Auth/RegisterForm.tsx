import React, { useState } from "react";
import { Eye, X, Heart, Mail, Phone, User, HeartHandshake } from "lucide-react";
import AnimatedButton from "../lib-animated/Button";
import { HeartFilled } from "@ant-design/icons";

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

const RegisterForm: React.FC<RegisterFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    avatar_url: "",
  });

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    console.log("Dữ liệu gửi đăng ký:", data);
    // Here you could add validation before submitting
    onSubmit(data);

    // Reset form after submission
    setRegisterData({
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      name: "",
      avatar_url: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-3xl w-[95%] max-w-[480px] relative border-4 border-primary-color shadow-2xl modal ${isOpen ? "modal-visible" : ""
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-300 transform hover:rotate-90 p-1"
        >
          <X className="h-6 w-6" />
        </button>

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
          <div className="form-input flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
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

          <div className="form-input flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
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

          <div className="form-input flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
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

          <div className="form-input flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
            <Eye className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu*"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
            />
          </div>

          <div className="form-input flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
            <Eye className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu*"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
            />
          </div>
          <AnimatedButton
            icon={HeartHandshake}
            text="Đăng ký"
            size="full"
            withFullWidth={true}
            primary
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => handleRegisterSubmit(registerData)}
          />
        </div>

        <div className="text-center mt-6 text-gray-500 text-xs">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <a href="#" className="text-primary-color hover:underline">
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="#" className="text-primary-color hover:underline">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
