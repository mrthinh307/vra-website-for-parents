import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { message } from 'antd';

// Interface cho context truyền từ MainLayout
interface MainLayoutContext {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: { username: string; avatar?: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ username: string; avatar?: string } | null>>;
  showRegisterForm: boolean;
  setShowRegisterForm: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToTop: () => void;
  scrollToLoginForm: () => void;
}

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isLoggedIn, scrollToLoginForm } = useOutletContext<MainLayoutContext>();

  React.useEffect(() => {
    if (!isLoggedIn) {
      message.warning('Vui lòng đăng nhập để truy cập trang này', 3);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    // Chuyển hướng về trang chủ và hiển thị form đăng nhập
    setTimeout(() => {
      scrollToLoginForm();
    }, 500);
    
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};

export default ProtectedRoute;
