import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  LockOutlined,
  MenuOutlined,
  NotificationOutlined,
  PlusOutlined,
  ReadOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { apiClient } from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';

interface MenuItem {
  id: string;
  code: string;
  title: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  parentTitle: string | null;
  level: number;
  type: number; // 1: Group, 2: Item
  sortOrder: number;
  isActive: boolean;
  children?: MenuItem[];
}

// Danh mục Icon trực quan Ant Design
const ICON_OPTIONS = [
  { value: 'DashboardOutlined', label: 'Bảng Điều Khiển (Tổng quan)', icon: <DashboardOutlined /> },
  { value: 'BankOutlined', label: 'Phòng Học (Cơ sở vật chất)', icon: <BankOutlined /> },
  { value: 'BookOutlined', label: 'Môn Học (Học phần)', icon: <BookOutlined /> },
  { value: 'TeamOutlined', label: 'Cán Bộ & Giảng Viên', icon: <TeamOutlined /> },
  { value: 'ReadOutlined', label: 'Học Viên & Sinh Viên', icon: <ReadOutlined /> },
  { value: 'UserOutlined', label: 'Người Dùng & Tài Khoản', icon: <UserOutlined /> },
  { value: 'CalendarOutlined', label: 'Khóa Học & Niên Khóa', icon: <CalendarOutlined /> },
  { value: 'ClusterOutlined', label: 'Lớp Học & Đào Tạo', icon: <ClusterOutlined /> },
  { value: 'ScheduleOutlined', label: 'Khung Chương Trình & Kế Hoạch', icon: <ScheduleOutlined /> },
  { value: 'TrophyOutlined', label: 'Bảng Điểm & Kết Quả Thi', icon: <TrophyOutlined /> },
  { value: 'CheckCircleOutlined', label: 'Điểm Danh & Chuyên Cần', icon: <CheckCircleOutlined /> },
  { value: 'FileTextOutlined', label: 'Đề Thi & Ngân Hàng Câu Hỏi', icon: <FileTextOutlined /> },
  { value: 'AuditOutlined', label: 'Đánh Giá & Dự Giờ', icon: <AuditOutlined /> },
  { value: 'SafetyCertificateOutlined', label: 'Nhóm Quyền & Phân Quyền', icon: <SafetyCertificateOutlined /> },
  { value: 'AppstoreOutlined', label: 'Cây Menu & Cấu Hình', icon: <AppstoreOutlined /> },
  { value: 'FolderOutlined', label: 'Thư Mục Nhóm Cha', icon: <FolderOutlined /> },
  { value: 'SettingOutlined', label: 'Cài Đặt Hệ Thống', icon: <SettingOutlined /> },
  { value: 'NotificationOutlined', label: 'Thông Báo & Tin Tức', icon: <NotificationOutlined /> },
];

// Danh mục Tất Cả Các Đường Dẫn (Route URLs) Khả Dụng Trong Hệ Thống Frontend
interface SystemRouteOption {
  path: string;
  label: string;
  module: string;
  suggestedCode: string;
  suggestedTitle: string;
  suggestedIcon: string;
  isCore?: boolean;
}

const AVAILABLE_SYSTEM_ROUTES: SystemRouteOption[] = [
  {
    path: '/',
    label: '/ — Bảng Điều Khiển Tổng Quan',
    module: 'Identity.API',
    suggestedCode: 'DASHBOARD',
    suggestedTitle: 'Bảng Điều Khiển',
    suggestedIcon: 'DashboardOutlined',
  },
  {
    path: '/rooms',
    label: '/rooms — Quản Lý Phòng Học',
    module: 'Catalog.API',
    suggestedCode: 'CATALOG_ROOMS',
    suggestedTitle: 'Quản Lý Phòng Học',
    suggestedIcon: 'BankOutlined',
  },
  {
    path: '/users',
    label: '/users — Tài Khoản Người Dùng Tổng Hợp',
    module: 'Identity.API',
    suggestedCode: 'USER_ALL',
    suggestedTitle: 'Tài Khoản Tổng Hợp',
    suggestedIcon: 'UserOutlined',
  },
  {
    path: '/users/staff',
    label: '/users/staff — Cán Bộ & Giảng Viên',
    module: 'Identity.API',
    suggestedCode: 'USER_STAFF',
    suggestedTitle: 'Cán Bộ & Giảng Viên',
    suggestedIcon: 'TeamOutlined',
  },
  {
    path: '/users/students',
    label: '/users/students — Học Viên & Sinh Viên',
    module: 'Identity.API',
    suggestedCode: 'USER_STUDENT',
    suggestedTitle: 'Học Viên & Sinh Viên',
    suggestedIcon: 'ReadOutlined',
  },
  {
    path: '/system/menus',
    label: '/system/menus — Cây Menu & Thứ Tự Hiển Thị [Cốt lõi]',
    module: 'Identity.API',
    suggestedCode: 'MENU_MANAGE',
    suggestedTitle: 'Sắp Xếp Menu',
    suggestedIcon: 'AppstoreOutlined',
    isCore: true,
  },
  {
    path: '/system/permission-groups',
    label: '/system/permission-groups — Nhóm Quyền & Ma Trận RBAC [Cốt lõi]',
    module: 'Identity.API',
    suggestedCode: 'PERMISSION_GROUP_MANAGE',
    suggestedTitle: 'Phân Quyền',
    suggestedIcon: 'SafetyCertificateOutlined',
    isCore: true,
  },
  {
    path: '/account/settings',
    label: '/account/settings — Hồ Sơ Cá Nhân & Cài Đặt',
    module: 'Identity.API',
    suggestedCode: 'ACCOUNT_SETTINGS',
    suggestedTitle: 'Hồ Sơ & Cài Đặt',
    suggestedIcon: 'SettingOutlined',
  },
  {
    path: '/subjects',
    label: '/subjects — Quản Lý Môn Học',
    module: 'Catalog.API',
    suggestedCode: 'CATALOG_SUBJECTS',
    suggestedTitle: 'Quản Lý Môn Học',
    suggestedIcon: 'BookOutlined',
  },
  {
    path: '/courses',
    label: '/courses — Khóa Học & Niên Khóa',
    module: 'Catalog.API',
    suggestedCode: 'CATALOG_COURSES',
    suggestedTitle: 'Khóa Học & Niên Khóa',
    suggestedIcon: 'CalendarOutlined',
  },
  {
    path: '/classes',
    label: '/classes — Quản Lý Lớp Học',
    module: 'Academic.API',
    suggestedCode: 'ACADEMIC_CLASSES',
    suggestedTitle: 'Quản Lý Lớp Học',
    suggestedIcon: 'ClusterOutlined',
  },
  {
    path: '/curriculums',
    label: '/curriculums — Khung Chương Trình Đào Tạo',
    module: 'Academic.API',
    suggestedCode: 'ACADEMIC_CURRICULUMS',
    suggestedTitle: 'Khung Chương Trình Đào Tạo',
    suggestedIcon: 'ScheduleOutlined',
  },
  {
    path: '/grades',
    label: '/grades — Quản Lý Điểm Số',
    module: 'Grading.API',
    suggestedCode: 'GRADING_GRADES',
    suggestedTitle: 'Quản Lý Điểm Số',
    suggestedIcon: 'TrophyOutlined',
  },
  {
    path: '/attendances',
    label: '/attendances — Điểm Danh & Chuyên Cần',
    module: 'Grading.API',
    suggestedCode: 'GRADING_ATTENDANCES',
    suggestedTitle: 'Điểm Danh & Chuyên Cần',
    suggestedIcon: 'CheckCircleOutlined',
  },
];

// Hàm kiểm tra mục cốt lõi hệ thống (Chống Lockout)
// Khóa cả Nhóm Cấu hình và MỤC CON /system/menus, /system/permission-groups
export const isSystemProtected = (record?: { code?: string | null; path?: string | null } | null): boolean => {
  if (!record) return false;
  const code = (record.code || '').trim().toUpperCase();
  const path = (record.path || '').trim().toLowerCase();

  const protectedCodes = [
    'SYSTEM_GROUP',
    'SYSTEM_MENUS',
    'MENU_MANAGE',
    'SYSTEM_PERMISSIONS',
    'PERMISSION_GROUP_MANAGE',
    'PERMISSION_GROUP',
  ];

  if (protectedCodes.includes(code)) return true;
  if (path === '/system/menus' || path === '/system/permission-groups') return true;

  return false;
};

export const MenuManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal tạo / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Watch loại menu đang chọn (1: Group, 2: Item) để ẩn/hiện hoặc bắt buộc chọn Route URL
  const selectedType = Form.useWatch('type', form);

  // Danh sách chỉ gồm các nhóm cha (type === 1) để gán cho ParentId
  const [parentGroupOptions, setParentGroupOptions] = useState<{ id: string; title: string }[]>([]);

  // Tải danh sách cây menu
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/auth/menus');
      if (res.data?.success) {
        const treeData: MenuItem[] = res.data.data || [];
        setData(treeData);

        // Quy chuẩn: CHỈ những menu có type === 1 (Nhóm cha) mới được xuất hiện trong dropdown chọn cha
        const groups: { id: string; title: string }[] = [];
        const extractGroups = (items: MenuItem[]) => {
          items.forEach((item) => {
            if (item.type === 1) {
              groups.push({ id: item.id, title: item.title });
            }
            if (item.children && item.children.length > 0) {
              extractGroups(item.children);
            }
          });
        };
        extractGroups(treeData);
        setParentGroupOptions(groups);
      } else {
        message.error(res.data?.message || 'Không thể tải danh sách menu');
      }
    } catch {
      message.error('Lỗi khi tải danh sách menu hệ thống');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Tập hợp các Đường dẫn (Paths) đang có trên Cây Menu
  const existingPaths = useMemo(() => {
    const paths = new Set<string>();
    const traverse = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.path) paths.add(item.path.trim().toLowerCase());
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return paths;
  }, [data]);

  // Mở modal tạo menu mới
  const handleOpenCreateModal = (parent?: MenuItem) => {
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({
      type: parent ? 2 : 1,
      parentId: parent ? parent.id : undefined,
      sortOrder: (parent?.children?.length || data.length) + 1,
      isActive: true,
      path: parent ? '/rooms' : undefined,
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa menu
  const handleOpenEditModal = (record: MenuItem) => {
    setEditingMenu(record);
    form.resetFields();
    form.setFieldsValue({
      code: record.code,
      title: record.title,
      path: record.path,
      icon: record.icon,
      parentId: record.parentId,
      type: record.type,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

  // Khi người dùng chọn 1 URL từ danh mục hệ thống: Tự động gợi ý Title, Code, Icon tương ứng nếu chưa có
  const handleUrlSelect = (selectedPath: string) => {
    const routeInfo = AVAILABLE_SYSTEM_ROUTES.find((r) => r.path === selectedPath);
    if (!routeInfo) return;

    const currentTitle = form.getFieldValue('title');
    const currentCode = form.getFieldValue('code');
    const currentIcon = form.getFieldValue('icon');

    const updates: Partial<{ title: string; code: string; icon: string }> = {};
    if (!currentTitle) updates.title = routeInfo.suggestedTitle;
    if (!currentCode) updates.code = routeInfo.suggestedCode;
    if (!currentIcon) updates.icon = routeInfo.suggestedIcon;

    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  };

  // Bật / Tắt nhanh trạng thái Hiển thị / Ẩn ngay trên từng dòng trong Table
  const handleQuickToggleActive = async (record: MenuItem, checked: boolean) => {
    if (isSystemProtected(record) && !checked) {
      message.warning('Mục hệ thống cốt lõi không được phép ẩn để chống mất quyền truy cập!');
      return;
    }

    try {
      const res = await apiClient.put(`/api/auth/menus/${record.id}`, {
        title: record.title,
        code: record.code,
        path: record.path,
        icon: record.icon,
        parentId: record.parentId,
        type: record.type,
        sortOrder: record.sortOrder,
        isActive: checked,
      });

      if (res.data?.success) {
        message.success(`Đã ${checked ? 'hiển thị' : 'ẩn'} menu "${record.title}"`);
        fetchMenus();
        window.dispatchEvent(new CustomEvent('app:menu-updated'));
      } else {
        message.error(res.data?.message || 'Không thể cập nhật trạng thái menu');
      }
    } catch {
      message.error('Lỗi kết nối khi cập nhật trạng thái');
    }
  };

  // Submit modal (Tạo mới hoặc Cập nhật)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Nếu là Nhóm cha (type === 1) thì path luôn là null/rỗng
      if (values.type === 1) {
        values.path = null;
      }

      // Tự động sinh Code kỹ thuật ngầm nếu chưa có
      if (!values.code) {
        if (values.type === 2 && values.path) {
          const matched = AVAILABLE_SYSTEM_ROUTES.find((r) => r.path === values.path);
          values.code = matched
            ? matched.suggestedCode
            : values.path.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().replace(/^_+|_+$/g, '');
        } else {
          const slug = (values.title || 'GROUP')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toUpperCase()
            .replace(/^_+|_+$/g, '');
          values.code = `${slug}_GROUP`;
        }
      }

      // Bảo vệ: Nếu là menu hệ thống cốt lõi thì isActive luôn luôn là true
      if (editingMenu && isSystemProtected(editingMenu)) {
        values.isActive = true;
      }

      if (editingMenu) {
        const res = await apiClient.put(`/api/auth/menus/${editingMenu.id}`, values);
        if (res.data?.success) {
          message.success('Cập nhật menu thành công!');
          setIsModalOpen(false);
          fetchMenus();
          window.dispatchEvent(new CustomEvent('app:menu-updated'));
        } else {
          message.error(res.data?.message || 'Cập nhật menu thất bại');
        }
      } else {
        const res = await apiClient.post('/api/auth/menus', values);
        if (res.data?.success) {
          message.success('Thêm menu mới thành công!');
          setIsModalOpen(false);
          fetchMenus();
          window.dispatchEvent(new CustomEvent('app:menu-updated'));
        } else {
          message.error(res.data?.message || 'Thêm menu thất bại');
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa menu
  const handleDelete = async (record: MenuItem) => {
    if (isSystemProtected(record)) {
      message.error('Không được phép xóa menu hệ thống cốt lõi!');
      return;
    }

    try {
      const res = await apiClient.delete(`/api/auth/menus/${record.id}`);
      if (res.data?.success) {
        message.success('Xóa menu thành công!');
        fetchMenus();
        window.dispatchEvent(new CustomEvent('app:menu-updated'));
      } else {
        message.error(res.data?.message || 'Không thể xóa menu');
      }
    } catch {
      message.error('Lỗi khi xóa menu');
    }
  };

  // Di chuyển thứ tự (Tăng / Giảm SortOrder)
  const handleMoveOrder = async (record: MenuItem, direction: 'up' | 'down') => {
    let siblingList: MenuItem[] = [];
    if (!record.parentId) {
      siblingList = [...data];
    } else {
      const findSiblings = (items: MenuItem[]): MenuItem[] => {
        for (const item of items) {
          if (item.id === record.parentId) {
            return item.children || [];
          }
          if (item.children) {
            const found = findSiblings(item.children);
            if (found.length > 0) return found;
          }
        }
        return [];
      };
      siblingList = [...findSiblings(data)];
    }

    siblingList.sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = siblingList.findIndex((x) => x.id === record.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblingList.length) {
      message.info(direction === 'up' ? 'Menu đã ở vị trí đầu tiên' : 'Menu đã ở vị trí cuối cùng');
      return;
    }

    const currentItem = siblingList[currentIndex];
    const targetItem = siblingList[targetIndex];

    const currentOrder = currentItem.sortOrder;
    const targetOrder =
      targetItem.sortOrder === currentOrder
        ? direction === 'up'
          ? currentOrder - 1
          : currentOrder + 1
        : targetItem.sortOrder;

    try {
      const batchPayload = {
        items: [
          { id: currentItem.id, sortOrder: targetOrder, parentId: currentItem.parentId },
          { id: targetItem.id, sortOrder: currentOrder, parentId: targetItem.parentId },
        ],
      };

      const res = await apiClient.put('/api/auth/menus/reorder', batchPayload);
      if (res.data?.success) {
        message.success('Đã cập nhật thứ tự menu');
        fetchMenus();
        window.dispatchEvent(new CustomEvent('app:menu-updated'));
      } else {
        message.error(res.data?.message || 'Cập nhật thứ tự thất bại');
      }
    } catch {
      message.error('Lỗi khi lưu thứ tự menu');
    }
  };

  // Helper hiển thị icon đồ họa thật trong bảng
  const renderTableIcon = (iconName: string | null) => {
    const found = ICON_OPTIONS.find((item) => item.value === iconName);
    if (!found) {
      return <Typography.Text type="secondary">—</Typography.Text>;
    }
    return (
      <Tooltip title={iconName}>
        <Space size={6} align="center">
          <span
            style={{
              fontSize: 16,
              color: isDarkMode ? '#60A5FA' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {found.icon}
          </span>
          <span
            style={{
              fontSize: 12,
              color: isDarkMode ? '#94A3B8' : '#64748B',
            }}
          >
            {iconName}
          </span>
        </Space>
      </Tooltip>
    );
  };

  // Các cột trong bảng
  const columns = [
    {
      title: 'Tiêu đề Menu',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: MenuItem) => {
        const isCoreProtected = isSystemProtected(record);
        return (
          <Space>
            {record.type === 1 ? (
              <FolderOutlined style={{ color: '#F59E0B', fontSize: 16 }} />
            ) : (
              <MenuOutlined style={{ color: '#3B82F6', fontSize: 14 }} />
            )}
            <span style={{ fontWeight: record.type === 1 ? 600 : 400 }}>{title}</span>
            {isCoreProtected && <LockOutlined style={{ color: '#F59E0B', fontSize: 12 }} />}
          </Space>
        );
      },
    },
    {
      title: 'Đường dẫn (Route / Path)',
      dataIndex: 'path',
      key: 'path',
      render: (path: string | null) =>
        path ? (
          <code
            style={{
              background: isDarkMode ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.08)',
              color: isDarkMode ? '#60A5FA' : '#1D4ED8',
              border: isDarkMode
                ? '1px solid rgba(96, 165, 250, 0.3)'
                : '1px solid rgba(59, 130, 246, 0.15)',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.3px',
              display: 'inline-block',
            }}
          >
            {path}
          </code>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Biểu tượng (Icon)',
      dataIndex: 'icon',
      key: 'icon',
      width: 170,
      render: (icon: string | null) => renderTableIcon(icon),
    },
    {
      title: 'Phân loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: number) =>
        type === 1 ? (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              background: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
              color: isDarkMode ? '#FBBF24' : '#B45309',
              border: isDarkMode
                ? '1px solid rgba(245, 158, 11, 0.35)'
                : '1px solid #FDE68A',
            }}
          >
            Nhóm cha
          </span>
        ) : (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              background: isDarkMode ? 'rgba(56, 189, 248, 0.18)' : '#E0F2FE',
              color: isDarkMode ? '#38BDF8' : '#0369A1',
              border: isDarkMode
                ? '1px solid rgba(56, 189, 248, 0.35)'
                : '1px solid #BAE6FD',
            }}
          >
            Mục con
          </span>
        ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 130,
      align: 'center' as const,
      render: (order: number, record: MenuItem) => (
        <Space size={4}>
          <span
            style={{
              display: 'inline-block',
              padding: '1px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              background: isDarkMode ? 'rgba(168, 85, 247, 0.22)' : '#F3E8FF',
              color: isDarkMode ? '#C084FC' : '#7E22CE',
              border: isDarkMode
                ? '1px solid rgba(168, 85, 247, 0.4)'
                : '1px solid #E9D5FF',
            }}
          >
            {order}
          </span>
          <Tooltip title="Chuyển lên trên">
            <Button
              type="text"
              size="small"
              icon={
                <ArrowUpOutlined
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? '#CBD5E1' : '#64748B',
                  }}
                />
              }
              onClick={() => handleMoveOrder(record, 'up')}
            />
          </Tooltip>
          <Tooltip title="Chuyển xuống dưới">
            <Button
              type="text"
              size="small"
              icon={
                <ArrowDownOutlined
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? '#CBD5E1' : '#64748B',
                  }}
                />
              }
              onClick={() => handleMoveOrder(record, 'down')}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Trạng thái hiển thị',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      align: 'center' as const,
      render: (isActive: boolean, record: MenuItem) => {
        const isCoreProtected = isSystemProtected(record);
        return (
          <Switch
            checkedChildren="Hiện"
            unCheckedChildren="Ẩn"
            checked={isActive}
            disabled={isCoreProtected}
            onChange={(checked) => handleQuickToggleActive(record, checked)}
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      align: 'center' as const,
      render: (_: unknown, record: MenuItem) => {
        const isCoreProtected = isSystemProtected(record);
        return (
          <Space size="small">
            {record.type === 1 && (
              <Tooltip title="Thêm mục con">
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ color: '#10B981' }} />}
                  onClick={() => handleOpenCreateModal(record)}
                />
              </Tooltip>
            )}

            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: '#3B82F6' }} />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            {!isCoreProtected && (
              <Popconfirm
                placement="left"
                title="Xóa Menu"
                description={`Bạn có chắc chắn muốn xóa "${record.title}" cùng toàn bộ mục con?`}
                onConfirm={() => handleDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const currentIcon = Form.useWatch('icon', form);
  const selectedIconObj = ICON_OPTIONS.find((item) => item.value === currentIcon);
  const isEditingCore = Boolean(editingMenu && isSystemProtected(editingMenu));

  return (
    <div>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: isDarkMode
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: 16,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space align="center" size="middle">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: isDarkMode
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 22, color: '#F59E0B' }} />
              </div>
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Quản Lý Menu & Thứ Tự Hiển Thị
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  Tùy biến cấu trúc Menu Sidebar, điều chỉnh thứ tự và trạng thái
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchMenus}>
                Tải lại
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCreateModal()}>
                Thêm Nhóm Menu Gốc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bảng dạng cây */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: isDarkMode
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          defaultExpandAllRows
        />
      </Card>

      {/* Modal Thêm mới / Sửa Menu */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#F59E0B' }} />
            <span>{editingMenu ? `Chỉnh Sửa Menu: ${editingMenu.title}` : 'Thêm Mới Menu'}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingMenu ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Loại menu" rules={[{ required: true }]}>
                <Radio.Group disabled={isEditingCore}>
                  <Radio value={1}>Nhóm cha (Group)</Radio>
                  <Radio value={2}>Mục con (Item)</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* ĐƯỜNG DẪN URL: DROPDOWN CHỌN TRỰC TIẾP TỪ CÁC ROUTE HỆ THỐNG */}
            <Col span={12}>
              <Form.Item
                name="path"
                label={
                  <Space>
                    <span>Đường dẫn URL (Route Path)</span>
                    {isEditingCore && (
                      <Tag color="blue" icon={<LockOutlined />}>
                        Đã khóa
                      </Tag>
                    )}
                  </Space>
                }
                rules={
                  selectedType === 2
                    ? [{ required: true, message: 'Vui lòng chọn hoặc nhập đường dẫn URL' }]
                    : []
                }
              >
                {selectedType === 1 ? (
                  <Input disabled />
                ) : (
                  <Select
                    placeholder="-- Chọn đường dẫn URL hệ thống --"
                    showSearch
                    allowClear
                    disabled={isEditingCore}
                    onChange={handleUrlSelect}
                    optionFilterProp="label"
                    options={AVAILABLE_SYSTEM_ROUTES
                      .filter((route) => {
                        // Nếu đang chỉnh sửa thì cho phép giữ URL hiện tại của chính menu đó
                        if (editingMenu && editingMenu.path?.toLowerCase() === route.path.toLowerCase()) {
                          return true;
                        }
                        // Loại bỏ hoàn toàn những URL đã có trên Cây Menu
                        return !existingPaths.has(route.path.toLowerCase());
                      })
                      .map((route) => ({
                        value: route.path,
                        label: route.label,
                      }))}
                    notFoundContent={
                      <div style={{ padding: '12px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                        Đã sử dụng hết tất cả dịch vụ trong hệ thống
                      </div>
                    }
                  />
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề hiển thị"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề menu' }]}
              >
                <Input placeholder="Ví dụ: Quản Lý Phòng Học" />
              </Form.Item>
            </Col>

            {/* Mã định danh Code được tự động sinh ngầm theo quy chuẩn, không cần người dùng nhập tay */}
            <Form.Item name="code" hidden>
              <Input />
            </Form.Item>

            {/* BỘ CHỌN ICON TRỰC QUAN */}
            <Col span={12}>
              <Form.Item
                name="icon"
                label={
                  <Space>
                    <span>Biểu tượng (Icon)</span>
                    {selectedIconObj && (
                      <Tag color="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {selectedIconObj.icon} Xem trước
                      </Tag>
                    )}
                  </Space>
                }
              >
                <Select
                  placeholder="Chọn biểu tượng trực quan"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={ICON_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: (
                      <Space>
                        <span style={{ fontSize: 15, color: '#1E40AF', verticalAlign: 'middle' }}>
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="Thứ tự hiển thị (SortOrder)"
                rules={[{ required: true, message: 'Nhập số thứ tự' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            {/* TRẠNG THÁI HIỂN THỊ / ẨN */}
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái hiển thị trên Menu"
                valuePropName="checked"
                extra="Bật để hiển thị trên Sidebar, tắt để ẩn."
              >
                <Switch
                  checkedChildren="Hiển thị"
                  unCheckedChildren="Ẩn"
                  disabled={isEditingCore}
                />
              </Form.Item>
            </Col>

            {/* CHỈ HIỂN THỊ CÁC NHÓM CHA (TYPE === 1) ĐỂ GÁN LÀM CHA */}
            <Col span={12}>
              <Form.Item
                name="parentId"
                label="Thuộc nhóm cha"
              >
                <Select
                  allowClear
                  placeholder="Chọn nhóm cha"
                  disabled={isEditingCore && editingMenu?.type === 1}
                  options={parentGroupOptions
                    .filter((m) => !editingMenu || m.id !== editingMenu.id)
                    .map((m) => ({
                      value: m.id,
                      label: `📁 ${m.title}`,
                    }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagementPage;
