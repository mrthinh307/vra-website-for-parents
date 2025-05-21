import React, { useState } from "react";
import { Menu, X, User, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <User className="h-5 w-5" />,
      label: "Thông tin cá nhân",
      onClick: () => {
        navigate("/profile");
      },
    },
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Đổi mật khẩu",
      onClick: () => {
        // TODO: Implement change password modal
        alert("Chức năng đang được phát triển");
      },
    },
    {
      icon: <LogOut className="h-5 w-5" />,
      label: "Đăng xuất",
      onClick: onLogout,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-primary-color/10 transition-colors duration-300"
      >
        <Menu className="h-6 w-6 text-primary-color" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
