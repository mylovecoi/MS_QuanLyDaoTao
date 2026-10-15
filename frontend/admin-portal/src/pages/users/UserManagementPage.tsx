import React, { useCallback, useEffect, useState } from 'react';
import {
  BankOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';
import { getFullAvatarUrl } from '../../utils/url';

interface UserItem {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
}

interface UserProfileDetail {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  role: string | number;
  roleName?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  staffCode?: string | null;
  staffInfo?: { staffCode?: string };
  departmentName?: string | null;
  position?: string | null;
  positionName?: string | null;
  permissionGroupId?: string | null;
  permissionGroupName?: string | null;
  studentCode?: string | null;
  studentInfo?: { studentCode?: string };
  citizenId?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  socialInsuranceNumber?: string | null;
  socialInsuranceCode?: string | null;
  healthInsuranceNumber?: string | null;
  healthInsuranceCode?: string | null;
}

interface CreateUserFormValues {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: number;
}

interface UpdateUserFormValues {
  fullName: string;
  email?: string;
  role: number;
}

interface ResetPasswordFormValues {
  newPassword: string;
}

import { useDebounce } from '../../hooks/useDebounce';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  const [selectedRole, setSelectedRole] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<boolean | 'ALL'>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm<CreateUserFormValues>();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm] = Form.useForm<UpdateUserFormValues>();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [resetForm] = Form.useForm<ResetPasswordFormValues>();

  // Drawer Xem chi tiết 360 độ
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileDetail | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber,
        pageSize,
      };
      if (debouncedSearchTerm.trim()) params.searchTerm = debouncedSearchTerm.trim();
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (selectedStatus !== 'ALL') params.isActive = selectedStatus;

      const response = await apiClient.get('/api/auth/users', { params });
      if (response.data?.success && response.data?.data) {
        setUsers(response.data.data.items || []);
        setTotal(response.data.data.totalRecords || 0);
      } else {
        message.error(response.data?.message || 'Không thể tải danh sách tài khoản.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, debouncedSearchTerm, selectedRole, selectedStatus]);

  // Tự động nhảy về trang 1 khi từ khóa tìm kiếm thay đổi
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search submit
  const handleSearch = () => {
    setPageNumber(1);
    fetchUsers();
  };

  // Handle Pagination change
  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current) setPageNumber(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  // Role Badge helper - Xử lý an toàn cả string lẫn number
  const renderRoleTag = (role: string | number | undefined | null) => {
    let roleStr = '';
    if (typeof role === 'number') {
      roleStr = role === 1 ? 'ADMIN' : role === 2 ? 'STAFF' : role === 3 ? 'STUDENT' : String(role);
    } else if (typeof role === 'string') {
      roleStr = role;
    }

    switch (roleStr.toUpperCase()) {
      case 'ADMIN':
        return <Tag color="blue">Quản Trị Viên</Tag>;
      case 'STAFF':
      case 'CANBO':
        return <Tag color="green">Cán Bộ Đào Tạo</Tag>;
      case 'STUDENT':
      case 'HOCVIEN':
        return <Tag color="purple">Học Viên</Tag>;
      default:
        return <Tag color="default">{roleStr || 'Chưa phân vai trò'}</Tag>;
    }
  };

  // Create User
  const handleCreateSubmit = async (values: CreateUserFormValues) => {
    setCreateLoading(true);
    try {
      const response = await apiClient.post('/api/auth/users', values);
      if (response.data?.success) {
        message.success('Thêm tài khoản mới thành công!');
        setCreateModalOpen(false);
        createForm.resetFields();
        fetchUsers();
      } else {
        message.error(response.data?.message || 'Không thể thêm tài khoản.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo tài khoản.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email || undefined,
      role: user.roleId,
    });
    setEditModalOpen(true);
  };

  // Edit User
  const handleEditSubmit = async (values: UpdateUserFormValues) => {
    if (!editingUser) return;
    setEditLoading(true);
    try {
      const response = await apiClient.put(`/api/auth/users/${editingUser.id}`, values);
      if (response.data?.success) {
        message.success('Cập nhật tài khoản thành công!');
        setEditModalOpen(false);
        setEditingUser(null);
        editForm.resetFields();
        fetchUsers();
      } else {
        message.error(response.data?.message || 'Không thể cập nhật tài khoản.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật tài khoản.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenReset = (user: UserItem) => {
    setResettingUser(user);
    resetForm.resetFields();
    setResetModalOpen(true);
  };

  // Reset Password Submit
  const handleResetSubmit = async (values: ResetPasswordFormValues) => {
    if (!resettingUser) return;
    setResetLoading(true);
    try {
      const response = await apiClient.put(`/api/auth/users/${resettingUser.id}/reset-password`, values);
      if (response.data?.success) {
        message.success(`Đặt lại mật khẩu cho tài khoản "${resettingUser.username}" thành công!`);
        setResetModalOpen(false);
        setResettingUser(null);
        resetForm.resetFields();
      } else {
        message.error(response.data?.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setResetLoading(false);
    }
  };

  // Toggle User Active Status
  const handleToggleStatus = async (user: UserItem) => {
    try {
      const response = await apiClient.patch(`/api/auth/users/${user.id}/toggle-status`);
      if (response.data?.success) {
        message.success(response.data.message || 'Cập nhật trạng thái thành công!');
        fetchUsers();
      } else {
        message.error(response.data?.message || 'Không thể thay đổi trạng thái.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản.');
    }
  };

  // Open 360 Detail Drawer
  const handleOpenDetail = async (user: UserItem) => {
    setSelectedUserForDetail(user);
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/api/auth/profile/user/${user.id}`);
      if (res.data?.success) {
        setUserProfile(res.data.data);
      } else {
        message.error(res.data?.message || 'Không thể tải chi tiết hồ sơ');
      }
    } catch {
      message.error('Lỗi khi tải thông tin hồ sơ tài khoản');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => (
        <Space>
          <UserOutlined style={{ color: '#1E40AF' }} />
          <Typography.Text strong>{username}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Họ Và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) =>
        email ? (
          <Space>
            <MailOutlined style={{ color: '#64748B' }} />
            <span>{email}</span>
          </Space>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => renderRoleTag(role),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="error" text="Đã khóa" />
        ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: UserItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết 360°">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#06B6D4' }} />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#2563EB' }} />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              icon={<KeyOutlined style={{ color: '#D97706' }} />}
              onClick={() => handleOpenReset(record)}
            />
          </Tooltip>

          <Popconfirm
            title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
            description={`Bạn có chắc muốn ${record.isActive ? 'khóa' : 'kích hoạt'} tài khoản "${record.username}"?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Đồng ý"
            cancelText="Hủy"
            placement="left"
          >
            <Button
              type="text"
              danger={record.isActive}
              icon={
                record.isActive ? (
                  <StopOutlined />
                ) : (
                  <CheckCircleOutlined style={{ color: '#16A34A' }} />
                )
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Title Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Quản Lý Tài Khoản
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              Quản trị người dùng, phân quyền truy cập hệ thống
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  createForm.resetFields();
                  setCreateModalOpen(true);
                }}
              >
                Thêm Tài Khoản
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filter Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={10} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo vai trò"
              value={selectedRole}
              onChange={(val) => {
                setSelectedRole(val);
                setPageNumber(1);
              }}
              options={[
                { label: 'Tất cả vai trò', value: 'ALL' },
                { label: 'Quản Trị Viên (Admin)', value: 1 },
                { label: 'Cán Bộ Đào Tạo', value: 2 },
                { label: 'Học Viên', value: 3 },
              ]}
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPageNumber(1);
              }}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đang hoạt động', value: true },
                { label: 'Đã khóa', value: false },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Tìm Kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (totalCount) => `Tổng cộng ${totalCount} tài khoản`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal Thêm Mới Tài Khoản */}
      <Modal
        title="Thêm Mới Tài Khoản"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ role: 3 }}>
          <Form.Item
            name="username"
            label="Tên Đăng Nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: canbo02, hocvien02..." />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật Khẩu Khởi Tạo"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ Và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa Chỉ Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Ví dụ: an.nv@qldaotao.edu.vn" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Phân Quyền Vai Trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              options={[
                { label: 'Quản Trị Viên (Admin)', value: 1 },
                { label: 'Cán Bộ Đào Tạo', value: 2 },
                { label: 'Học Viên', value: 3 },
              ]}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>
                Thêm Tài Khoản
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chỉnh Sửa Tài Khoản */}
      <Modal
        title={`Chỉnh Sửa Tài Khoản: ${editingUser?.username}`}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="fullName"
            label="Họ Và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa Chỉ Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Ví dụ: an.nv@qldaotao.edu.vn" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai Trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              options={[
                { label: 'Quản Trị Viên (Admin)', value: 1 },
                { label: 'Cán Bộ Đào Tạo', value: 2 },
                { label: 'Học Viên', value: 3 },
              ]}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Lưu Thay Đổi
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Đặt Lại Mật Khẩu */}
      <Modal
        title={`Đặt Lại Mật Khẩu: ${resettingUser?.username}`}
        open={resetModalOpen}
        onCancel={() => setResetModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetSubmit}>
          <Form.Item
            name="newPassword"
            label="Mật Khẩu Mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setResetModalOpen(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit" loading={resetLoading}>
                Xác Nhận Đặt Lại
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Tài Khoản 360 Độ */}
      <Drawer
        title={
          <Space>
            <UserOutlined style={{ color: '#2563EB' }} />
            <span>Hồ Sơ Tài Khoản 360°</span>
          </Space>
        }
        width={680}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          selectedUserForDetail && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerOpen(false);
                handleOpenEdit(selectedUserForDetail);
              }}
            >
              Chỉnh Sửa
            </Button>
          )
        }
      >
        <Spin spinning={detailLoading}>
          {userProfile && (
            <div>
              {/* Header Profile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  marginBottom: 20,
                }}
              >
                <Avatar
                  size={68}
                  src={getFullAvatarUrl(userProfile.avatar || userProfile.avatarUrl)}
                  icon={!(userProfile.avatar || userProfile.avatarUrl) && <UserOutlined />}
                  style={{ backgroundColor: '#2563EB', fontSize: 28 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {userProfile.fullName}
                    </Typography.Title>
                    {renderRoleTag(userProfile.roleName || userProfile.role)}
                    {(userProfile.staffCode || userProfile.staffInfo?.staffCode) && (
                      <Tag color="blue">{userProfile.staffCode || userProfile.staffInfo?.staffCode}</Tag>
                    )}
                    {(userProfile.studentCode || userProfile.studentInfo?.studentCode) && (
                      <Tag color="cyan">{userProfile.studentCode || userProfile.studentInfo?.studentCode}</Tag>
                    )}
                  </div>
                  <Space size="middle" wrap>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      @{userProfile.username}
                    </Typography.Text>
                    {selectedUserForDetail?.isActive ? (
                      <Badge status="success" text={<span style={{ color: '#16A34A', fontSize: 13 }}>Hoạt động</span>} />
                    ) : (
                      <Badge status="error" text={<span style={{ color: '#DC2626', fontSize: 13 }}>Đã khóa</span>} />
                    )}
                    {userProfile.permissionGroupName && (
                      <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                        {userProfile.permissionGroupName}
                      </Tag>
                    )}
                  </Space>
                </div>
              </div>

              {/* Khối 1: Thông tin hệ thống & Liên hệ */}
              <Typography.Text strong style={{ fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <UserOutlined style={{ color: '#2563EB' }} /> 1. Thông Tin Hệ Thống & Nghiệp Vụ
              </Typography.Text>
              <Descriptions
                bordered
                size="small"
                column={1}
                style={{ marginBottom: 20 }}
                styles={{ label: { width: 170, fontWeight: 500, background: '#F8FAFC', color: '#475569' } }}
              >
                {/* Ưu tiên Mã định danh nghiệp vụ Cán bộ / Học viên */}
                {(userProfile.staffCode || userProfile.staffInfo?.staffCode) && (
                  <Descriptions.Item label="Mã Cán Bộ">
                    <Tag color="blue" style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px' }}>
                      {userProfile.staffCode || userProfile.staffInfo?.staffCode}
                    </Tag>
                  </Descriptions.Item>
                )}
                {(userProfile.studentCode || userProfile.studentInfo?.studentCode) && (
                  <Descriptions.Item label="Mã Học Viên">
                    <Tag color="cyan" style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px' }}>
                      {userProfile.studentCode || userProfile.studentInfo?.studentCode}
                    </Tag>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Tên đăng nhập">
                  <Typography.Text strong>@{userProfile.username}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò hệ thống">
                  {renderRoleTag(userProfile.roleName || userProfile.role)}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ Email">
                  {userProfile.email || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {userProfile.phoneNumber || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban / Bộ môn">
                  {userProfile.departmentName || <Typography.Text type="secondary">Chưa thiết lập</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ công tác">
                  {userProfile.positionName || userProfile.position || <Typography.Text type="secondary">Chưa thiết lập</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm phân quyền">
                  {userProfile.permissionGroupName ? (
                    <Tag color="purple">{userProfile.permissionGroupName}</Tag>
                  ) : (
                    <Typography.Text type="secondary">Mặc định theo vai trò</Typography.Text>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />

              {/* Khối 2: Định danh & Ngân hàng / Bảo hiểm */}
              <Typography.Text strong style={{ fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <IdcardOutlined style={{ color: '#06B6D4' }} /> 2. Định Danh & Tài Khoản Ngân Hàng / Bảo Hiểm
              </Typography.Text>
              <Descriptions
                bordered
                size="small"
                column={1}
                styles={{ label: { width: 170, fontWeight: 500, background: '#F8FAFC', color: '#475569' } }}
              >
                <Descriptions.Item label="Số CCCD / CMND">
                  {userProfile.citizenId ? (
                    <Tag color="geekblue" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {userProfile.citizenId}
                    </Tag>
                  ) : (
                    <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản NH">
                  {userProfile.bankAccount ? (
                    <Typography.Text strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>
                      {userProfile.bankAccount}
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngân hàng">
                  {userProfile.bankName ? (
                    <Space>
                      <BankOutlined style={{ color: '#3B82F6' }} />
                      <span>{userProfile.bankName}</span>
                    </Space>
                  ) : (
                    <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Mã số BHXH">
                  {userProfile.socialInsuranceNumber || userProfile.socialInsuranceCode ? (
                    <Tag color="cyan">{userProfile.socialInsuranceNumber || userProfile.socialInsuranceCode}</Tag>
                  ) : (
                    <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Mã thẻ BHYT">
                  {userProfile.healthInsuranceNumber || userProfile.healthInsuranceCode ? (
                    <Tag color="green">{userProfile.healthInsuranceNumber || userProfile.healthInsuranceCode}</Tag>
                  ) : (
                    <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default UserManagementPage;
