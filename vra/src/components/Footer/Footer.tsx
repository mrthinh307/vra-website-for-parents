import React, { useEffect } from 'react';
import { FacebookIcon, Twitter, Instagram, Linkedin, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Logo1 } from '../../assets/images';

interface FooterProps {
  scrollToTop?: () => void;
}

const Footer: React.FC<FooterProps> = () => {
  // Initialize footer animations on mount
  useEffect(() => {
    const animatedElements = document.querySelectorAll('.footer [data-aos]');
    animatedElements.forEach((element) => {
      element.classList.add('aos-animate');
    });
  }, []);
  return (
    <footer className="footer w-full bg-gradient-to-b from-gray-50 to-white pt-24 pb-8">
      <div className="px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div
            className="md:col-span-1"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <img
              src={Logo1}
              alt="VRA Logo"
              className="mb-6 h-14 transform transition-all duration-300 hover:scale-105"
            />
            <p className="text-gray-600 mb-6 leading-relaxed">
              VRA là một hệ thống hỗ trợ can thiệp sớm cho trẻ tự kỷ
              thông qua trải nghiệm thực tế ảo. Web VRA cho phụ
              huynh/giáo viên quản lý quá trình học của trẻ.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: FacebookIcon, color: "text-blue-600" },
                { icon: Twitter, color: "text-blue-400" },
                { icon: Instagram, color: "text-pink-600" },
                { icon: Linkedin, color: "text-blue-700" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className={`${social.color} p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 transform hover:scale-110`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div
            className="md:col-span-1"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3 className="text-primary-color font-bold text-lg mb-6">
              Chăm sóc khách hàng
            </h3>
            <ul className="space-y-3">
              {[
                "Hướng dẫn thanh toán",
                "Điều kiện giao dịch chung",
                "Quy trình sử dụng dịch vụ",
                "Chính sách bảo hành",
                "Chính sách hoàn trả hàng",
                "Chính sách bảo mật",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="footer-link text-gray-600 hover:text-primary-color flex items-center"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 text-primary-color" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="md:col-span-1"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h3 className="text-primary-color font-bold text-lg mb-6">
              Tính năng
            </h3>
            <ul className="space-y-3">
              {[
                "Xem thông tin trẻ",
                "Quản lý danh sách",
                "Cấu hình bài học",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="footer-link text-gray-600 hover:text-primary-color flex items-center"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 text-primary-color" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="md:col-span-1"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <h3 className="text-primary-color font-bold text-lg mb-6">
              Liên hệ với chúng tôi
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-color flex items-start group"
                >
                  <MapPin className="h-5 w-5 mr-3 text-primary-color flex-shrink-0 mt-1 group-hover:animate-pulse" />
                  <span>
                    Biển Caribe
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+84123456789"
                  className="text-gray-600 hover:text-primary-color flex items-center group"
                >
                  <Phone className="h-5 w-5 mr-3 text-primary-color group-hover:animate-pulse" />
                  <span>+ 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@vrahealth.com"
                  className="text-gray-600 hover:text-primary-color flex items-center group"
                >
                  <Mail className="h-5 w-5 mr-3 text-primary-color group-hover:animate-pulse" />
                  <span>support@vrahealth.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider mt-16 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2023 VRA Health. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-primary-color text-sm transition-colors duration-300"
            >
              Điều khoản sử dụng
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-primary-color text-sm transition-colors duration-300"
            >
              Chính sách bảo mật
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-primary-color text-sm transition-colors duration-300"
            >
              Trợ giúp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
