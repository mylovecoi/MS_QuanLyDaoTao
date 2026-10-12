import React, { useState } from 'react';
import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Tổng Quan',
    },
    {
      key: 'sub-catalog',
      icon: <AppstoreOutlined />,
      label: 'Danh Mục Dùng Chung',
      children: [
        {
          key: '/rooms',
          icon: <BankOutlined />,
          label: 'Quản Lý Phòng Học',
        },
        {
          key: '/subjects',
          icon: <BookOutlined />,
          label: 'Quản Lý Môn Học',
        },
        {
          key: '/courses',
          icon: <CalendarOutlined />,
          label: 'Khóa Học & Niên Khóa',
        },
      ],
    },
    {
      key: 'sub-academic',
      icon: <TeamOutlined />,
      label: 'Quản Lý Học Vụ',
      children: [
        {
          key: '/classes',
          label: 'Danh Sách Lớp Học',
        },
        {
          key: '/curriculums',
          label: 'Khung Chương Trình',
        },
      ],
    },
    {
      key: 'sub-grading',
      icon: <FileDoneOutlined />,
      label: 'Khảo Thí & Đánh Giá',
      children: [
        {
          key: '/attendances',
          label: 'Điểm Danh Sinh Viên',
        },
        {
          key: '/grades',
          label: 'Bảng Điểm Môn Học',
        },
      ],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Quản Lý Tài Khoản',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: () => logout(),
    },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return <Tag color="blue">Quản Trị Viên</Tag>;
      case 'CANBO':
        return <Tag color="green">Cán Bộ Đào Tạo</Tag>;
      case 'HOCVIEN':
        return <Tag color="purple">Học Viên</Tag>;
      default:
        return <Tag color="default">{role}</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        collapsedWidth={80}
        style={{
          background: isDarkMode ? '#0F172A' : '#1E293B',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ĐT
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12, overflow: 'hidden' }}>
              <Typography.Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                QL ĐÀO TẠO
              </Typography.Text>
              <Typography.Text
                style={{
                  color: '#94A3B8',
                  fontSize: 11,
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Hệ thống Microservices
              </Typography.Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['sub-catalog']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 0,
            marginTop: 8,
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
            height: 64,
          }}
        >
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <Breadcrumb
              items={[
                { title: 'Trang chủ' },
                {
                  title:
                    location.pathname === '/'
                      ? 'Tổng quan'
                      : location.pathname === '/rooms'
                      ? 'Quản lý phòng học'
                      : location.pathname === '/users'
                      ? 'Quản lý tài khoản'
                      : location.pathname,
                },
              ]}
            />
          </Space>

          <Space size="large" align="center">
            {/* Chuyển đổi Dark / Light Mode (Mặt trời / Mặt trăng) */}
            <ThemeToggle />

            {/* Thông tin User & Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }} size="small">
                <Avatar
                  style={{
                    backgroundColor: '#1E40AF',
                    verticalAlign: 'middle',
                  }}
                  icon={<UserOutlined />}
                >
                  {user?.fullName?.charAt(0) || 'A'}
                </Avatar>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <Typography.Text strong style={{ fontSize: 13, display: 'block' }}>
                    {user?.fullName || 'Người dùng'}
                  </Typography.Text>
                  {getRoleBadge(user?.role)}
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Body */}
        <Content
          style={{
            padding: 24,
            background: token.colorBgLayout,
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
