import React, { useCallback, useEffect, useState } from 'react';
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
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
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { apiClient } from '../api/client';

const { Header, Sider, Content } = Layout;

interface BackendMenuItem {
  id: string;
  code: string;
  title: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  type: number; // 1: Group, 2: Item
  sortOrder: number;
  isActive: boolean;
  children?: BackendMenuItem[];
}

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuTree, setMenuTree] = useState<BackendMenuItem[]>([]);
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // Helper render Icon Antd động từ chuỗi lưu trong Database
  const renderDynamicIcon = (iconName?: string | null) => {
    switch (iconName) {
      case 'DashboardOutlined': return <DashboardOutlined />;
      case 'BankOutlined': return <BankOutlined />;
      case 'BookOutlined': return <BookOutlined />;
      case 'TeamOutlined': return <TeamOutlined />;
      case 'ReadOutlined': return <ReadOutlined />;
      case 'UserOutlined': return <UserOutlined />;
      case 'CalendarOutlined': return <CalendarOutlined />;
      case 'ClusterOutlined': return <ClusterOutlined />;
      case 'ScheduleOutlined': return <ScheduleOutlined />;
      case 'TrophyOutlined': return <TrophyOutlined />;
      case 'CheckCircleOutlined': return <CheckCircleOutlined />;
      case 'FileTextOutlined': return <FileTextOutlined />;
      case 'AuditOutlined': return <AuditOutlined />;
      case 'SafetyCertificateOutlined': return <SafetyCertificateOutlined />;
      case 'AppstoreOutlined': return <AppstoreOutlined />;
      case 'FolderOutlined': return <FolderOutlined />;
      case 'SettingOutlined': return <SettingOutlined />;
      case 'NotificationOutlined': return <NotificationOutlined />;
      case 'IdcardOutlined': return <IdcardOutlined />;
      case 'FileDoneOutlined': return <FileDoneOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  // Tải Cây Menu Phân Quyền Động từ Backend theo User đang đăng nhập
  const fetchMenuTree = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/auth/menus/my-permissions');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMenuTree(res.data.data);
      }
    } catch {
      // Fallback nếu mạng lỗi
    }
  }, []);

  useEffect(() => {
    fetchMenuTree();

    // Lắng nghe sự kiện menu được cập nhật từ MenuManagementPage để làm mới ngay lập tức
    const handleMenuUpdated = () => {
      fetchMenuTree();
    };
    window.addEventListener('app:menu-updated', handleMenuUpdated);
    return () => {
      window.removeEventListener('app:menu-updated', handleMenuUpdated);
    };
  }, [fetchMenuTree]);

  // Chuyển đổi Cây Menu Backend sang cấu trúc MenuProps['items'] của Ant Design
  const transformToAntdMenuItems = (items: BackendMenuItem[]): MenuProps['items'] => {
    return items
      .filter((item) => item.isActive !== false)
      .map((item) => {
        const rawChildren = item.children && item.children.length > 0 ? item.children : [];
        const activeChildren = rawChildren.filter((c) => c.isActive !== false);
        const hasChildren = activeChildren.length > 0;

        // Nếu là Nhóm cha (type === 1 hoặc không có đường dẫn path) mà không có con nào được xem thì ẩn luôn nhóm cha
        const isGroup = item.type === 1 || !item.path;
        if (isGroup && !hasChildren) {
          return null;
        }

        const key = item.path || `sub-${item.id}`;
        return {
          key,
          icon: renderDynamicIcon(item.icon),
          label: item.title,
          children: hasChildren ? transformToAntdMenuItems(activeChildren) : undefined,
        };
      })
      .filter(Boolean) as MenuProps['items'];
  };

  const dynamicMenuItems = transformToAntdMenuItems(menuTree);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key && !e.key.startsWith('sub-')) {
      navigate(e.key);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân & Cài đặt',
      onClick: () => navigate('/account/settings'),
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

  // Breadcrumb ĐỘNG 100%: Tự động tra cứu theo URL từ Cây Menu trong Database (Không fix cứng switch-case)
  const getBreadcrumbTitle = () => {
    if (location.pathname === '/account/settings') return 'Hồ sơ cá nhân & Cài đặt';

    const searchTitle = (items: BackendMenuItem[]): string | null => {
      for (const item of items) {
        if (item.path === location.pathname) {
          return item.title;
        }
        if (item.children && item.children.length > 0) {
          const found = searchTitle(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return searchTitle(menuTree) || location.pathname;
  };

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

  // Tìm tất cả Submenu cha chứa URL hiện tại
  const findParentKeys = useCallback((items: BackendMenuItem[], currentPath: string): string[] => {
    const parentKeys: string[] = [];
    const traverse = (list: BackendMenuItem[], parents: string[]) => {
      for (const item of list) {
        const itemKey = item.path || `sub-${item.id}`;
        if (item.path === currentPath) {
          parentKeys.push(...parents);
          return;
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children, [...parents, itemKey]);
        }
      }
    };
    traverse(items, []);
    return parentKeys;
  }, []);

  // Quản lý trạng thái mở rộng Menu, khởi tạo từ localStorage
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_open_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tự động mở rộng Submenu chứa trang hiện tại khi F5 hoặc chuyển link
  useEffect(() => {
    if (menuTree.length > 0 && location.pathname) {
      const activeParents = findParentKeys(menuTree, location.pathname);
      if (activeParents.length > 0) {
        setOpenKeys((prev) => {
          const merged = Array.from(new Set([...prev, ...activeParents]));
          localStorage.setItem('admin_sidebar_open_keys', JSON.stringify(merged));
          return merged;
        });
      }
    }
  }, [menuTree, location.pathname, findParentKeys]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
    localStorage.setItem('admin_sidebar_open_keys', JSON.stringify(keys));
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
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={handleOpenChange}
          items={dynamicMenuItems}
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
                { title: getBreadcrumbTitle() },
              ]}
            />
          </Space>

          <Space size="middle" align="center">
            {/* Lối tắt Cài đặt hệ thống & Quản trị Menu (Khẩn cấp, chống Lockout) */}
            <Tooltip>
              <Button
                type="text"
                shape="circle"
                icon={<SettingOutlined style={{ fontSize: 18, color: '#F59E0B' }} />}
                onClick={() => navigate('/system/menus')}
              />
            </Tooltip>

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
                  src={
                    user?.avatarUrl
                      ? (user.avatarUrl.startsWith('http')
                          ? user.avatarUrl
                          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}${user.avatarUrl}`)
                      : undefined
                  }
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
