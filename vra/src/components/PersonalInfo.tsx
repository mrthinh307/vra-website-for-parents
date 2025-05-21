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
  const [currentData, setCurrentData] = useState(studentData);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={currentData}
        className="space-y-4"
        onFinish={handleSubmit}
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <Avatar
            size={120}
            src={avatarUrl || currentData?.avatar}
            icon={<UserOutlined />}
            className="border-2 border-gray-200 mb-4"
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
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <UploadOutlined className="mr-2" />
              Thay đổi ảnh đại diện
            </button>
          </Upload>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Tuổi"
            name="age"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
          >
            <Input type="number" placeholder="Nhập tuổi" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngôn ngữ"
            name="language"
            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
          >
            <Select placeholder="Chọn ngôn ngữ">
              <Option value="vietnamese">Tiếng Việt</Option>
              <Option value="english">Tiếng Anh</Option>
              <Option value="chinese">Tiếng Trung</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Thông tin người giám hộ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Tên người giám hộ"
              name="guardianName"
              rules={[{ required: true, message: 'Vui lòng nhập tên người giám hộ' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên người giám hộ" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="guardianPhone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="guardianEmail"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label="Mối quan hệ"
              name="relationship"
              rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ' }]}
            >
              <Select placeholder="Chọn mối quan hệ">
                <Option value="parent">Cha/Mẹ</Option>
                <Option value="grandparent">Ông/Bà</Option>
                <Option value="sibling">Anh/Chị</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            onClick={showConfirmAndSubmit}
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default PersonalInfo; 