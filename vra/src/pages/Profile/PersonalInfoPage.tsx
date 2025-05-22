import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import PersonalInfo from '../../components/PersonalInfo';
import dayjs from 'dayjs';
import './PersonalInfoPage.css';

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
    <div className="personal-info-container">
      <div className="personal-info-form">
        <h2>Thông tin cá nhân</h2>
        <PersonalInfo studentData={mockStudentData} />
      </div>
    </div>
  );
};

export default PersonalInfoPage; 