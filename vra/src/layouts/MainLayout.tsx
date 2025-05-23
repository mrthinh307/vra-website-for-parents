import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { apiConfig } from '../api/config';

/**
 * MainLayout component that provides consistent header and footer across pages
 * Uses React Router's Outlet for rendering child routes
 */
function MainLayout() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  // Khởi tạo trạng thái đăng nhập từ localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  // Khởi tạo thông tin người dùng từ localStorage
  const [user, setUser] = useState<{ username: string; email: string; avatar?: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const location = useLocation();

  // Reset scroll position when the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Kiểm tra token và tự động đăng nhập khi khởi động ứng dụng
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Gọi API để kiểm tra token
          const response = await fetch(`${apiConfig.baseURL}/auth/validate-token`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsLoggedIn(true);
            setUser({
              username: userData.user?.username || userData.user?.email,
              email: userData.user?.email,
              avatar: userData.user?.avatar_url
            });
            
            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify({
              username: userData.user?.username || userData.user?.email,
              email: userData.user?.email,
              avatar: userData.user?.avatar_url
            }));
          } else {
            // Token không hợp lệ, xóa khỏi localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };
    
    validateToken();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToLoginForm = () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      const headerHeight = document.querySelector(".header")?.clientHeight || 80;
      window.scrollTo({
        top: loginForm.offsetTop - headerHeight - 60,
        behavior: "smooth",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Gọi API đăng xuất
      await fetch(`${apiConfig.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      // Cập nhật state
      setIsLoggedIn(false);
      setUser(null);
      
      // Xóa thông tin khỏi localStorage khi đăng xuất
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        scrollToLoginForm={scrollToLoginForm}
        setShowRegisterForm={setShowRegisterForm}
        isLoggedIn={isLoggedIn}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      {/* Main Content - Will be replaced by the matched route */}
      <main className="flex-grow pt-20">
        <Outlet context={{ 
          showRegisterForm, 
          setShowRegisterForm, 
          scrollToTop, 
          scrollToLoginForm,
          isLoggedIn,
          setIsLoggedIn,
          user,
          setUser
        }} />
      </main>
      
      <Footer />
    </div>
  );
}

export default MainLayout;