import React, { useCallback, useEffect, useState } from 'react';
import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
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
  DatePicker,
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
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import { getFullAvatarUrl } from '../../utils/url';

// Enum StaffType: Teacher = 0, Manager = 1, Leader = 2, Principal = 3
const STAFF_TYPES = [
  { value: 0, label: 'Giảng viên / Giáo viên', color: 'blue' },
  { value: 1, label: 'Cán bộ Quản lý', color: 'cyan' },
  { value: 2, label: 'Cán bộ Lãnh đạo', color: 'orange' },
  { value: 3, label: 'Hiệu trưởng / BGH', color: 'red' },
];

import { VIETNAM_BANKS } from '../../constants/banks';

interface StaffItem {
  id: string; // UserId
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  staffCode: string;
  staffType: number;
  staffTypeName: string;
  departmentId: string | null;
  signTitle: string | null;
  signFullName: string | null;
  permissionGroupId: string | null;
  permissionGroupName: string | null;
  academicRank: string | null;
  position: string | null;

  // Thông tin định danh & ngân hàng bảo hiểm
  dateOfBirth?: string | null;
  gender?: string | null;
  citizenId?: string | null;
  issueDate?: string | null;
  issuePlace?: string | null;
  address?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  socialInsuranceNumber?: string | null;
  healthInsuranceNumber?: string | null;
}

interface PermissionGroupOption {
  id: string;
  name: string;
}

export const StaffManagementPage: React.FC = () => {
  const [data, setData] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total) => `Tổng cộng ${total} cán bộ`,
  });

  // Tìm kiếm & Lọc
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 350);
  const [selectedStaffType, setSelectedStaffType] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<boolean | 'ALL'>('ALL');

  // Nhóm quyền danh sách options
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupOption[]>([]);

  // Modal tạo / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Drawer Xem Chi Tiết Hồ Sơ
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState<StaffItem | null>(null);

  // Load danh sách nhóm quyền
  const fetchPermissionGroups = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/auth/permission-groups');
      if (res.data?.success) {
        setPermissionGroups(res.data.data || []);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Fetch danh sách cán bộ
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {
          pageNumber: page,
          pageSize: size,
        };

        if (debouncedKeyword.trim()) {
          params.keyword = debouncedKeyword.trim();
        }
        if (selectedStaffType !== 'ALL') {
          params.staffType = selectedStaffType;
        }
        if (selectedStatus !== 'ALL') {
          params.isActive = selectedStatus;
        }

        const res = await apiClient.get('/api/auth/staff', { params });
        if (res.data?.success) {
          setData(res.data.data.items || []);
          setPagination((prev) => ({
            ...prev,
            current: res.data.data.pageNumber,
            pageSize: res.data.data.pageSize,
            total: res.data.data.totalCount,
          }));
        } else {
          message.error(res.data?.message || 'Không thể tải danh sách cán bộ');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu cán bộ');
      } finally {
        setLoading(false);
      }
    },
    [debouncedKeyword, selectedStaffType, selectedStatus]
  );

  useEffect(() => {
    fetchPermissionGroups();
  }, [fetchPermissionGroups]);

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, [debouncedKeyword, selectedStaffType, selectedStatus, fetchData, pagination.pageSize]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchData(newPagination.current || 1, newPagination.pageSize || 10);
  };

  // Mở Drawer Xem Chi Tiết
  const handleOpenViewDrawer = (record: StaffItem) => {
    setViewingStaff(record);
    setIsViewDrawerOpen(true);
  };

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    form.setFieldsValue({
      staffType: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (record: StaffItem) => {
    setEditingStaff(record);
    form.resetFields();
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      staffCode: record.staffCode,
      staffType: record.staffType,
      signTitle: record.signTitle,
      signFullName: record.signFullName,
      permissionGroupId: record.permissionGroupId,
      academicRank: record.academicRank,
      position: record.position,
      isActive: record.isActive,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      gender: record.gender,
      citizenId: record.citizenId,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      issuePlace: record.issuePlace,
      address: record.address,
      bankAccount: record.bankAccount,
      bankName: record.bankName,
      socialInsuranceNumber: record.socialInsuranceNumber,
      healthInsuranceNumber: record.healthInsuranceNumber,
    });
    setIsModalOpen(true);
  };

  // Submit form tạo / sửa
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        issueDate: values.issueDate ? values.issueDate.toISOString() : null,
      };

      if (editingStaff) {
        // Cập nhật
        const res = await apiClient.put(`/api/auth/staff/${editingStaff.id}`, payload);
        if (res.data?.success) {
          message.success('Cập nhật thông tin cán bộ thành công!');
          setIsModalOpen(false);
          fetchData(pagination.current, pagination.pageSize);
          if (viewingStaff && viewingStaff.id === editingStaff.id) {
            setViewingStaff({ ...viewingStaff, ...payload });
          }
        } else {
          message.error(res.data?.message || 'Cập nhật thất bại');
        }
      } else {
        // Tạo mới
        const res = await apiClient.post('/api/auth/staff', payload);
        if (res.data?.success) {
          message.success('Thêm mới cán bộ thành công!');
          setIsModalOpen(false);
          fetchData(1, pagination.pageSize);
        } else {
          message.error(res.data?.message || 'Thêm cán bộ thất bại');
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

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (record: StaffItem) => {
    try {
      const res = await apiClient.put(`/api/auth/staff/${record.id}`, {
        fullName: record.fullName,
        email: record.email,
        phoneNumber: record.phoneNumber,
        staffCode: record.staffCode,
        staffType: record.staffType,
        signTitle: record.signTitle,
        signFullName: record.signFullName,
        permissionGroupId: record.permissionGroupId,
        isActive: !record.isActive,
      });

      if (res.data?.success) {
        message.success(`${record.isActive ? 'Khóa' : 'Kích hoạt'} cán bộ thành công!`);
        fetchData(pagination.current, pagination.pageSize);
      } else {
        message.error(res.data?.message || 'Thao tác thất bại');
      }
    } catch {
      message.error('Lỗi khi thay đổi trạng thái');
    }
  };

  // Xóa cán bộ
  const handleDelete = async (record: StaffItem) => {
    try {
      const res = await apiClient.delete(`/api/auth/staff/${record.id}`);
      if (res.data?.success) {
        message.success('Đã xóa cán bộ thành công!');
        fetchData(pagination.current, pagination.pageSize);
      } else {
        message.error(res.data?.message || 'Xóa thất bại');
      }
    } catch {
      message.error('Lỗi khi xóa cán bộ');
    }
  };

  const getStaffTypeTag = (type: number) => {
    const item = STAFF_TYPES.find((t) => t.value === type);
    return <Tag color={item?.color || 'blue'}>{item?.label || 'Cán bộ'}</Tag>;
  };

  const columns = [
    {
      title: 'Mã CB',
      dataIndex: 'staffCode',
      key: 'staffCode',
      width: 110,
      render: (code: string) => <Tag color="geekblue" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: StaffItem) => (
        <Space size="middle">
          <Avatar
            size={38}
            src={getFullAvatarUrl(record.avatar)}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1E40AF', flexShrink: 0 }}
          />
          <div>
            <Typography.Text strong style={{ fontSize: 14, display: 'block' }}>
              {name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'staffType',
      key: 'staffType',
      width: 170,
      render: (type: number) => getStaffTypeTag(type),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: unknown, record: StaffItem) => (
        <div>
          <div>{record.email || '—'}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.phoneNumber || '—'}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'permissionGroupName',
      key: 'permissionGroupName',
      width: 160,
      render: (group: string | null) =>
        group ? <Tag color="purple">{group}</Tag> : <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Ký duyệt chứng chỉ',
      key: 'signature',
      width: 180,
      render: (_: unknown, record: StaffItem) =>
        record.signTitle ? (
          <div>
            <Tag color="volcano" style={{ marginBottom: 2 }}>{record.signTitle}</Tag>
            <div style={{ fontSize: 12, color: '#64748B' }}>{record.signFullName || record.fullName}</div>
          </div>
        ) : (
          <Typography.Text type="secondary">Chưa gán</Typography.Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean) =>
        isActive ? (
          <Badge status="success" text={<span style={{ color: '#16A34A', fontWeight: 500 }}>Hoạt động</span>} />
        ) : (
          <Badge status="error" text={<span style={{ color: '#DC2626', fontWeight: 500 }}>Đã khóa</span>} />
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center' as const,
      render: (_: unknown, record: StaffItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#10B981' }} />}
              onClick={() => handleOpenViewDrawer(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa hồ sơ">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#3B82F6' }} />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            placement="left"
            title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
            description={`Bạn có chắc muốn ${record.isActive ? 'khóa' : 'kích hoạt'} cán bộ ${record.fullName}?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              type="text"
              icon={
                record.isActive ? (
                  <StopOutlined style={{ color: '#EF4444' }} />
                ) : (
                  <CheckCircleOutlined style={{ color: '#10B981' }} />
                )
              }
            />
          </Popconfirm>

          <Popconfirm
            placement="left"
            title="Xóa cán bộ"
            description="Bạn có chắc chắn muốn xóa cán bộ này khỏi hệ thống?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<LockOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Title Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: 16,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Quản Lý Cán Bộ & Giảng Viên
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              Danh sách giáo viên, cán bộ quản lý đào tạo và ban giám hiệu
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                Thêm Cán Bộ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filter Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: 16,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={10} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, mã CB, email..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: '100%' }}
              value={selectedStaffType}
              onChange={(val) => setSelectedStaffType(val)}
              options={[
                { value: 'ALL', label: 'Tất cả phân loại' },
                ...STAFF_TYPES.map((t) => ({ value: t.value, label: t.label })),
              ]}
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: true, label: 'Đang hoạt động' },
                { value: false, label: 'Đã khóa' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Drawer Xem Chi Tiết Hồ Sơ Cán Bộ */}
      <Drawer
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#10B981' }} />
            <span>Hồ Sơ Chi Tiết Cán Bộ & Giảng Viên</span>
          </Space>
        }
        open={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        width={680}
        extra={
          viewingStaff && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsViewDrawerOpen(false);
                handleOpenEditModal(viewingStaff);
              }}
            >
              Chỉnh Sửa
            </Button>
          )
        }
      >
        {viewingStaff && (
          <div>
            {/* Thẻ Header cá nhân */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '16px 20px',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <Avatar
                size={76}
                src={getFullAvatarUrl(viewingStaff.avatar)}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1E40AF', flexShrink: 0 }}
              />
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {viewingStaff.fullName}
                </Typography.Title>
                <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                  Tài khoản: <b>@{viewingStaff.username}</b> | Mã CB: <b>{viewingStaff.staffCode}</b>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    {getStaffTypeTag(viewingStaff.staffType)}
                    {viewingStaff.isActive ? (
                      <Tag color="success">Đang hoạt động</Tag>
                    ) : (
                      <Tag color="error">Đã khóa</Tag>
                    )}
                  </Space>
                </div>
              </div>
            </div>

            {/* Khối 1: Thông tin công tác */}
            <Typography.Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IdcardOutlined style={{ color: '#3B82F6' }} /> Thông Tin Công Tác & Giảng Dạy
            </Typography.Title>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Mã Cán Bộ">{viewingStaff.staffCode}</Descriptions.Item>
              <Descriptions.Item label="Phân Loại">{viewingStaff.staffTypeName}</Descriptions.Item>
              <Descriptions.Item label="Chức Vụ">{viewingStaff.position || '—'}</Descriptions.Item>
              <Descriptions.Item label="Học Hàm / Học Vị">{viewingStaff.academicRank || '—'}</Descriptions.Item>
              <Descriptions.Item label="Nhóm Quyền">
                {viewingStaff.permissionGroupName ? (
                  <Tag color="purple">{viewingStaff.permissionGroupName}</Tag>
                ) : (
                  'Chưa gán nhóm quyền'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Chức Danh Ký">{viewingStaff.signTitle || 'Chưa gán'}</Descriptions.Item>
              <Descriptions.Item label="Họ Tên Người Ký">{viewingStaff.signFullName || viewingStaff.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày Tạo">{dayjs(viewingStaff.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            </Descriptions>

            {/* Khối 2: Thông tin định danh cá nhân */}
            <Typography.Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined style={{ color: '#10B981' }} /> Thông Tin Cá Nhân & Định Danh (Việt Nam)
            </Typography.Title>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Email">{viewingStaff.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">{viewingStaff.phoneNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngày Sinh">
                {viewingStaff.dateOfBirth ? dayjs(viewingStaff.dateOfBirth).format('DD/MM/YYYY') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới Tính">{viewingStaff.gender || '—'}</Descriptions.Item>
              <Descriptions.Item label="Số CCCD / CMND">
                <b>{viewingStaff.citizenId || '—'}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Cấp">
                {viewingStaff.issueDate ? dayjs(viewingStaff.issueDate).format('DD/MM/YYYY') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Nơi Cấp" span={2}>
                {viewingStaff.issuePlace || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ Thường Trú" span={2}>
                {viewingStaff.address || '—'}
              </Descriptions.Item>
            </Descriptions>

            {/* Khối 3: Ngân hàng & Bảo hiểm */}
            <Typography.Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BankOutlined style={{ color: '#F59E0B' }} /> Tài Khoản Ngân Hàng & Bảo Hiểm
            </Typography.Title>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Tên Ngân Hàng">{viewingStaff.bankName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Số Tài Khoản">
                <b>{viewingStaff.bankAccount || '—'}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Mã Số BHXH">
                <b>{viewingStaff.socialInsuranceNumber || '—'}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Số Thẻ BHYT">
                <b>{viewingStaff.healthInsuranceNumber || '—'}</b>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Modal Thêm mới / Sửa cán bộ */}
      <Modal
        title={
          <Space>
            <IdcardOutlined style={{ color: '#3B82F6' }} />
            <span>{editingStaff ? 'Chỉnh Sửa Thông Tin Cán Bộ' : 'Thêm Mới Cán Bộ / Giảng Viên'}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingStaff ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        width={760}
        destroyOnHidden
      >
        {/* Xem trước ảnh đại diện trong modal sửa */}
        {editingStaff && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 16px',
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Avatar
              size={52}
              src={getFullAvatarUrl(editingStaff.avatar)}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1E40AF' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{editingStaff.fullName}</div>
              <div style={{ color: '#64748B', fontSize: 12 }}>
                Tài khoản: @{editingStaff.username} | Mã CB: {editingStaff.staffCode}
              </div>
            </div>
          </div>
        )}

        <Form form={form} layout="vertical">
          <Tabs
            defaultActiveKey="general"
            items={[
              {
                key: 'general',
                label: '1. Thông tin công tác & liên hệ',
                children: (
                  <Row gutter={16}>
                    {!editingStaff && (
                      <>
                        <Col span={12}>
                          <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[
                              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                              { min: 3, message: 'Tối thiểu 3 ký tự' },
                            ]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Ví dụ: cb_nguyenvana" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="password"
                            label="Mật khẩu khởi tạo"
                            rules={[
                              { required: true, message: 'Vui lòng nhập mật khẩu' },
                              { min: 6, message: 'Tối thiểu 6 ký tự' },
                            ]}
                          >
                            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                          </Form.Item>
                        </Col>
                      </>
                    )}

                    <Col span={12}>
                      <Form.Item
                        name="staffCode"
                        label="Mã cán bộ"
                        rules={[{ required: true, message: 'Vui lòng nhập mã cán bộ' }]}
                      >
                        <Input placeholder="Ví dụ: CB001, GV102" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                      >
                        <Input placeholder="Ví dụ: Nguyễn Văn A" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="staffType"
                        label="Phân loại cán bộ"
                        rules={[{ required: true, message: 'Vui lòng chọn phân loại' }]}
                      >
                        <Select
                          options={STAFF_TYPES.map((t) => ({
                            value: t.value,
                            label: t.label,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="permissionGroupId" label="Nhóm phân quyền">
                        <Select
                          allowClear
                          placeholder="Chọn nhóm quyền áp dụng"
                          options={permissionGroups.map((g) => ({
                            value: g.id,
                            label: g.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Địa chỉ Email"
                        rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                      >
                        <Input placeholder="canbo@daotao.edu.vn" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                          {
                            pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                            message: 'SĐT Việt Nam không hợp lệ (10 số, đầu 03, 05, 07, 08, 09)',
                          },
                        ]}
                      >
                        <Input placeholder="0912 345 678" maxLength={11} />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="signTitle" label="Chức danh ký duyệt (Bằng / Chứng chỉ)">
                        <Input placeholder="Ví dụ: KT. HIỆU TRƯỞNG - PHÓ HIỆU TRƯỞNG" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="signFullName" label="Họ tên người ký hiển thị">
                        <Input placeholder="Để trống nếu trùng với họ tên cán bộ" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="academicRank" label="Học hàm / Học vị">
                        <Input placeholder="Ví dụ: Tiến sĩ, Thạc sĩ, PGS.TS" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="position" label="Chức vụ công tác">
                        <Input placeholder="Ví dụ: Trưởng bộ môn, Giảng viên chính" />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'identity',
                label: '2. Định danh & Ngân hàng / Bảo hiểm',
                children: (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="dateOfBirth" label="Ngày sinh">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="gender" label="Giới tính">
                        <Select
                          options={[
                            { label: 'Nam', value: 'Nam' },
                            { label: 'Nữ', value: 'Nữ' },
                            { label: 'Khác', value: 'Khác' },
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="citizenId"
                        label="Số CCCD / CMND"
                        rules={[
                          {
                            pattern: /^(\d{9}|\d{12})$/,
                            message: 'CCCD gồm đúng 12 chữ số (hoặc CMND cũ 9 số)',
                          },
                        ]}
                      >
                        <Input placeholder="001200000000" maxLength={12} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="issueDate" label="Ngày cấp CCCD">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="issuePlace" label="Nơi cấp">
                        <Input placeholder="Cục Cảnh sát QLHC về TTXH" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="address" label="Địa chỉ thường trú">
                        <Input placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Divider titlePlacement="left" style={{ margin: '8px 0 16px' }}>
                        Tài khoản Ngân hàng & Bảo hiểm
                      </Divider>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="bankName" label="Tên ngân hàng">
                        <Select
                          showSearch
                          allowClear
                          placeholder="Chọn ngân hàng"
                          options={VIETNAM_BANKS}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="bankAccount"
                        label="Số tài khoản"
                        rules={[
                          {
                            pattern: /^\d{6,20}$/,
                            message: 'Số tài khoản chỉ gồm chữ số (từ 6 đến 20 số)',
                          },
                        ]}
                      >
                        <Input placeholder="190300000000" maxLength={20} />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="socialInsuranceNumber"
                        label="Mã số BHXH"
                        rules={[
                          {
                            pattern: /^\d{10}$/,
                            message: 'Mã BHXH Việt Nam gồm đúng 10 chữ số',
                          },
                        ]}
                      >
                        <Input placeholder="10 chữ số BHXH" maxLength={10} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="healthInsuranceNumber"
                        label="Số thẻ BHYT"
                        rules={[
                          {
                            pattern: /^([A-Z]{2}[1-5]\d{2}\d{10}|\d{10}|\d{15})$/,
                            message: 'Số thẻ BHYT gồm 10 số (mẫu mới) hoặc 15 ký tự (mẫu cũ)',
                          },
                        ]}
                      >
                        <Input placeholder="10 số mẫu mới hoặc 15 ký tự mẫu cũ" maxLength={15} />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
