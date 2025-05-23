import React, { useState, useEffect } from 'react';
import { Avatar, Input, Select, DatePicker, Form, message, Upload, Modal } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';

const { Option } = Select;

interface PersonalInfoProps {
  studentData?: {
    fullName: string;
    avatar: string;
    age: number;
    dateOfBirth: string | dayjs.Dayjs;
    gender: string;
    language: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    relationship: string;
  };
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ studentData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(() => {
    if (studentData) {
      return {
        ...studentData,
        dateOfBirth: studentData.dateOfBirth ? dayjs(studentData.dateOfBirth) : null
      };
    }
    return null;
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Set initial form values when currentData changes
  useEffect(() => {
    if (currentData) {
      form.setFieldsValue(currentData);
    }
  }, [currentData, form]);

  // Hàm fetch dữ liệu từ database
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // TODO: Thay thế bằng API call thực tế
      const response = await fetch('/api/student/profile');
      const data = await response.json();
      
      // Chuyển đổi dateOfBirth string thành dayjs object
      const formattedData = {
        ...data,
        dateOfBirth: dayjs(data.dateOfBirth)
      };
      
      setCurrentData(formattedData);
      form.setFieldsValue(formattedData);
    } catch (error) {
      message.error('Không thể tải thông tin học sinh!');
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // Chuyển đổi dateOfBirth từ dayjs sang string ISO
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        avatar: avatarUrl || currentData?.avatar
      };
      // TODO: Thay thế bằng API call thực tế
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues)
      });
      if (!response.ok) {
        throw new Error('Cập nhật thất bại');
      }
      const updatedData = await response.json();
      setCurrentData({
        ...updatedData,
        dateOfBirth: dayjs(updatedData.dateOfBirth)
      });
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating info:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmAndSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận cập nhật',
      content: 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        form.submit();
      }
    });
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể upload file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // TODO: Thay thế bằng API call thực tế để upload ảnh
      // Giả lập URL ảnh sau khi upload
      const imageUrl = URL.createObjectURL(info.file.originFileObj as Blob);
      setAvatarUrl(imageUrl);
      setLoading(false);
      message.success('Upload ảnh thành công!');
    }
  };

  return (
    <div>
      {/* Title is already in parent component */}
      <Form
        form={form}
        layout="vertical"
        initialValues={currentData || {
          fullName: '',
          avatar: '',
          age: 0,
          dateOfBirth: null,
          gender: '',
          language: '',
          guardianName: '',
          guardianPhone: '',
          guardianEmail: '',
          relationship: ''
        }}
        className="personal-form"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <Avatar
            size={150}
            src={avatarUrl || currentData?.avatar}
            icon={<UserOutlined />}
            className="avatar-glow mb-4"
          />
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess?.("ok");
              }, 0);
            }}
          >
            <button
              type="button"
              className="flex items-center justify-center px-3 py-1 bg-black bg-opacity-25 rounded-md border border-white border-opacity-20 hover:bg-opacity-40 transition-all duration-300 text-sm avatar-upload-btn"
            >
              <UploadOutlined className="mr-1" />
              Thay đổi ảnh
            </button>
          </Upload>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            className="flex-1"
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" style={{ height: '42px' }} />
          </Form.Item>
          
          <Form.Item
            label="Tuổi"
            name="age"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
            className="flex-1"
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tuổi" style={{ height: '42px' }} />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            className="flex-1"
          >
            <DatePicker className="w-full" placeholder="Chọn ngày sinh" style={{ height: '42px' }} />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            className="flex-1"
          >
            <Select placeholder="Chọn giới tính" style={{ height: '42px' }}>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngôn ngữ"
            name="language"
            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            className="md:col-span-2"
            style={{ marginTop: '8px' }}
          >
            <Select placeholder="Chọn ngôn ngữ">
              <Option value="vietnamese">Tiếng Việt</Option>
              <Option value="english">Tiếng Anh</Option>
              <Option value="chinese">Tiếng Trung</Option>
            </Select>
          </Form.Item>
        </div>
        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-semibold mb-6">Thông tin người giám hộ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Tên người giám hộ"
              name="guardianName"
              rules={[{ required: true, message: 'Vui lòng nhập tên người giám hộ' }]}
              className="flex-1"
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên người giám hộ" style={{ height: '42px' }} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="guardianPhone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
              className="flex-1"
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" style={{ height: '42px' }} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="guardianEmail"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
              className="flex-1"
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" style={{ height: '42px' }} />
            </Form.Item>

            <Form.Item
              label="Mối quan hệ"
              name="relationship"
              rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ' }]}
              className="flex-1"
            >
              <Select placeholder="Chọn mối quan hệ" style={{ height: '42px' }}>
                <Option value="parent">Cha/Mẹ</Option>
                <Option value="grandparent">Ông/Bà</Option>
                <Option value="sibling">Anh/Chị</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="button"
            disabled={loading}
            onClick={showConfirmAndSubmit}
            className="px-8 py-3 w-auto min-w-[200px] text-white font-medium rounded-md hover:bg-opacity-90 transition-all duration-300"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default PersonalInfo; 