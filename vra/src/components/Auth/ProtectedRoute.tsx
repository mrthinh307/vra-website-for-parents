import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { message, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

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
      // Hiển thị thông báo warning trong UI
      message.warning('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập trang này.', 3);
      
      // Hiển thị modal thông báo
      Modal.info({
        title: 'Thông báo truy cập',
        icon: <UserOutlined style={{ color: '#1890ff' }} />,
        content: (
          <div className="py-2">
            <p>Bạn cần đăng nhập để truy cập trang này.</p>
            <p>Hệ thống sẽ chuyển bạn về trang chủ và hiển thị form đăng nhập.</p>
          </div>
        ),
        okText: 'Đã hiểu',
        maskClosable: true,
      });
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
