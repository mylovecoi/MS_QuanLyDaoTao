import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircleOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';

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

  // Role Badge helper
  const renderRoleTag = (role: string) => {
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
              Quản trị người dùng, phân quyền truy cập hệ thống theo mô hình Microservices
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
              placeholder="Tìm theo tên đăng nhập, họ tên, email..."
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
      <Card>
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
        destroyOnClose
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
        destroyOnClose
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
        destroyOnClose
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
    </div>
  );
};
