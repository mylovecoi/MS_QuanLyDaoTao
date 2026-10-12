import React, { useState } from 'react';
import {
  BankFilled,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Space,
  Spin,
  Tabs,
  theme,
  Typography,
} from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';

interface LoginFormValues {
  username: string;
  password: string;
  autoLogin?: boolean;
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>();
  const { token } = theme.useToken();

  // Nếu đã đăng nhập thành công trước đó, tự động chuyển thẳng về trang chủ Dashboard
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode ? '#0F172A' : '#F8FAFC',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/api/auth/login', {
        username: values.username.trim(),
        password: values.password,
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        login(data.accessToken, data.refreshToken, {
          userId: data.userId,
          username: data.username,
          fullName: data.fullName,
          role: data.role,
          roleId: data.roleId,
        });

        message.success(`Đăng nhập thành công. Xin chào, ${data.fullName}!`);
        navigate('/');
      } else {
        setErrorMessage(response.data?.message || 'Đăng nhập không thành công.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'auto',
        background: isDarkMode
          ? 'radial-gradient(circle at 50% 0%, #1E293B 0%, #0F172A 70%, #020617 100%)'
          : 'radial-gradient(circle at 50% 0%, #EFF6FF 0%, #F8FAFC 50%, #F1F5F9 100%)',
        position: 'relative',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Top Bar: Nút Đổi Theme Mặt Trời / Mặt Trăng góc trên phải */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 24px',
          height: 56,
        }}
      >
        <ThemeToggle />
      </div>

      {/* Main Content: Khung chuẩn Ant Design Pro Login */}
      <div
        style={{
          flex: 1,
          padding: '32px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Header Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: token.colorPrimary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 24,
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
              }}
            >
              <BankFilled />
            </div>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: '-0.5px',
              }}
            >
              QL ĐÀO TẠO
            </Typography.Title>
          </div>
          <Typography.Paragraph
            type="secondary"
            style={{
              margin: '6px 0 0',
              fontSize: 14,
            }}
          >
            Hệ thống Quản lý Đào tạo Đại học & Khảo thí chuẩn Microservices
          </Typography.Paragraph>
        </div>

        {/* Form Container (Độ rộng chuẩn 368px như Ant Design Pro) */}
        <div
          style={{
            width: '100%',
            maxWidth: 368,
          }}
        >
          {/* Tabs: Đăng nhập tài khoản */}
          <Tabs
            centered
            items={[
              {
                key: 'account',
                label: (
                  <span style={{ fontSize: 16, fontWeight: 500, padding: '0 8px' }}>
                    Đăng nhập tài khoản
                  </span>
                ),
              },
            ]}
            style={{ marginBottom: 20 }}
          />

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 20, borderRadius: 6 }}
              onClose={() => setErrorMessage(null)}
            />
          )}

          {/* Form */}
          <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ autoLogin: true }}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
              style={{ marginBottom: 20 }}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: token.colorPrimary, opacity: 0.7 }} />}
                placeholder="Tên tài khoản"
                style={{ height: 42, borderRadius: 6 }}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: token.colorPrimary, opacity: 0.7 }} />}
                placeholder="Mật khẩu"
                style={{ height: 42, borderRadius: 6 }}
                autoComplete="current-password"
              />
            </Form.Item>

            {/* Hàng Tùy Chọn: Nhớ mật khẩu & Quên mật khẩu */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Form.Item name="autoLogin" valuePropName="checked" noStyle>
                <Checkbox>Tự động đăng nhập</Checkbox>
              </Form.Item>
              <Typography.Link
                style={{ fontSize: 13 }}
                onClick={(e) => {
                  e.preventDefault();
                  message.info('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu.');
                }}
              >
                Quên mật khẩu?
              </Typography.Link>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: 42,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 6,
                  background: token.colorPrimary,
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Footer chuẩn phong cách Ant Design Pro */}
      <div
        style={{
          padding: '16px 0 24px',
          textAlign: 'center',
        }}
      >
        <Space
          split={<span style={{ color: isDarkMode ? '#475569' : '#CBD5E1' }}>|</span>}
          size="middle"
          style={{ marginBottom: 8 }}
        >
          <Typography.Link style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
            Cổng Đào Tạo
          </Typography.Link>
          <Typography.Link style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
            Chính Sách & Bảo Mật
          </Typography.Link>
          <Typography.Link style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
            Trợ Giúp Kỹ Thuật
          </Typography.Link>
        </Space>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            © 2026 Hệ Thống Quản Lý Đào Tạo Microservices. All rights reserved.
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};
