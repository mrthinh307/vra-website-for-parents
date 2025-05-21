import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import PersonalInfo from '../../components/PersonalInfo';
import dayjs from 'dayjs';

const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in a real application, this would come from an API
  const mockStudentData = {
    fullName: "Nguyễn Văn AA",
    avatar: "",
    age: 15,
    dateOfBirth: dayjs("2009-05-15"),
    gender: "male",
    language: "vietnamese",
    guardianName: "Nguyễn Văn B",
    guardianPhone: "0123456789",
    guardianEmail: "nguyenvanb@example.com",
    relationship: "parent"
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-12 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Home size={16} className="mr-2 text-primary-color" />
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-primary-color transition-colors duration-200 border-none bg-transparent cursor-pointer text-gray-600 p-0"
            >
              Trang chủ
            </button>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="font-medium text-primary-color">Thông tin cá nhân</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <PersonalInfo studentData={mockStudentData} />
      </div>
    </div>
  );
};

export default PersonalInfoPage; 