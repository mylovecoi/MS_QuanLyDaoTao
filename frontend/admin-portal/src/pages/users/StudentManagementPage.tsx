import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
  PlusOutlined,
  ReadOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
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
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';

interface StudentItem {
  id: string; // UserId
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  studentCode: string;
  classId: string | null;
  classPositionId: string | null;
  workplace: string | null;
  trainingResult: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  citizenId: string | null;
  address: string | null;
}

export const StudentManagementPage: React.FC = () => {
  const [data, setData] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total) => `Tổng cộng ${total} học viên`,
  });

  // Tìm kiếm & Lọc
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 350);
  const [selectedStatus, setSelectedStatus] = useState<boolean | 'ALL'>('ALL');

  // Modal tạo / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Drawer Xem chi tiết học viên
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Fetch danh sách học viên
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
        if (selectedStatus !== 'ALL') {
          params.isActive = selectedStatus;
        }

        const res = await apiClient.get('/api/auth/students', { params });
        if (res.data?.success) {
          setData(res.data.data.items || []);
          setPagination((prev) => ({
            ...prev,
            current: res.data.data.pageNumber,
            pageSize: res.data.data.pageSize,
            total: res.data.data.totalCount,
          }));
        } else {
          message.error(res.data?.message || 'Không thể tải danh sách học viên');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu học viên');
      } finally {
        setLoading(false);
      }
    },
    [debouncedKeyword, selectedStatus]
  );

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, [debouncedKeyword, selectedStatus, fetchData, pagination.pageSize]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchData(newPagination.current || 1, newPagination.pageSize || 10);
  };

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      gender: 'Nam',
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditModal = (record: StudentItem) => {
    setEditingStudent(record);
    form.resetFields();
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      studentCode: record.studentCode,
      workplace: record.workplace,
      trainingResult: record.trainingResult,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      gender: record.gender || 'Nam',
      citizenId: record.citizenId,
      address: record.address,
      isActive: record.isActive,
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
        dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).toISOString() : null,
      };

      if (editingStudent) {
        // Cập nhật
        const res = await apiClient.put(`/api/auth/students/${editingStudent.id}`, payload);
        if (res.data?.success) {
          message.success('Cập nhật thông tin học viên thành công!');
          setIsModalOpen(false);
          fetchData(pagination.current, pagination.pageSize);
        } else {
          message.error(res.data?.message || 'Cập nhật thất bại');
        }
      } else {
        // Tạo mới
        const res = await apiClient.post('/api/auth/students', payload);
        if (res.data?.success) {
          message.success('Thêm mới học viên thành công!');
          setIsModalOpen(false);
          fetchData(1, pagination.pageSize);
        } else {
          message.error(res.data?.message || 'Thêm học viên thất bại');
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
  const handleToggleStatus = async (record: StudentItem) => {
    try {
      const res = await apiClient.put(`/api/auth/students/${record.id}`, {
        fullName: record.fullName,
        email: record.email,
        phoneNumber: record.phoneNumber,
        studentCode: record.studentCode,
        workplace: record.workplace,
        trainingResult: record.trainingResult,
        isActive: !record.isActive,
      });

      if (res.data?.success) {
        message.success(`${record.isActive ? 'Khóa' : 'Kích hoạt'} tài khoản học viên thành công!`);
        fetchData(pagination.current, pagination.pageSize);
      } else {
        message.error(res.data?.message || 'Thao tác thất bại');
      }
    } catch {
      message.error('Lỗi khi thay đổi trạng thái');
    }
  };

  // Xóa học viên
  const handleDelete = async (record: StudentItem) => {
    try {
      const res = await apiClient.delete(`/api/auth/students/${record.id}`);
      if (res.data?.success) {
        message.success('Đã xóa học viên thành công!');
        fetchData(pagination.current, pagination.pageSize);
      } else {
        message.error(res.data?.message || 'Xóa thất bại');
      }
    } catch {
      message.error('Lỗi khi xóa học viên');
    }
  };

  const columns = [
    {
      title: 'Mã HV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (code: string) => <Tag color="cyan" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: StudentItem) => (
        <div>
          <Typography.Text strong style={{ fontSize: 14, display: 'block' }}>
            {name}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            @{record.username}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: unknown, record: StudentItem) => (
        <div>
          <div>{record.email || '—'}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.phoneNumber || '—'}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Đơn vị / Cơ quan',
      dataIndex: 'workplace',
      key: 'workplace',
      render: (wp: string | null) => wp || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Trạng thái đào tạo',
      dataIndex: 'trainingResult',
      key: 'trainingResult',
      width: 160,
      render: (result: string | null) =>
        result ? (
          <Tag color="green">{result}</Tag>
        ) : (
          <Tag color="default">Đang theo học</Tag>
        ),
    },
    {
      title: 'Tài khoản',
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
      width: 160,
      align: 'center' as const,
      render: (_: unknown, record: StudentItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#06B6D4' }} />}
              onClick={() => {
                setSelectedStudent(record);
                setDetailDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#3B82F6' }} />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            placement="left"
            title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
            description={`Bạn có chắc muốn ${record.isActive ? 'khóa' : 'kích hoạt'} học viên ${record.fullName}?`}
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
            title="Xóa học viên"
            description="Bạn có chắc chắn muốn xóa học viên này khỏi hệ thống?"
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
              Quản Lý Học Viên & Sinh Viên
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              Danh sách học viên tham gia các khóa học và lớp đào tạo
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                Thêm Học Viên
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
          <Col xs={24} sm={14} md={10}>
            <Input
              placeholder="Tìm kiếm theo tên, mã HV, email..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
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

      {/* Modal Thêm mới / Sửa học viên */}
      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: '#06B6D4' }} />
            <span>{editingStudent ? 'Chỉnh Sửa Thông Tin Học Viên' : 'Thêm Mới Học Viên'}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingStudent ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {!editingStudent && (
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
                    <Input prefix={<UserOutlined />} placeholder="Ví dụ: hv_tranthib" />
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
                name="studentCode"
                label="Mã học viên"
                rules={[{ required: true, message: 'Vui lòng nhập mã học viên' }]}
              >
                <Input placeholder="Ví dụ: HV2026-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Ví dụ: Trần Thị B" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="hocvien@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input placeholder="0987654321" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="workplace" label="Đơn vị / Cơ quan công tác">
                <Input placeholder="Ví dụ: Bệnh viện Đa khoa Tỉnh, Công ty ABC" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="citizenId" label="Số CCCD / CMND">
                <Input placeholder="001202001234" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select
                  options={[
                    { value: 'Nam', label: 'Nam' },
                    { value: 'Nữ', label: 'Nữ' },
                    { value: 'Khác', label: 'Khác' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ liên hệ">
                <Input placeholder="Ví dụ: Số 123 Đường Giải Phóng, Hà Nội" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Hồ Sơ Học Viên */}
      <Drawer
        title={
          <Space>
            <ReadOutlined style={{ color: '#06B6D4' }} />
            <span>Hồ Sơ Chi Tiết Học Viên</span>
          </Space>
        }
        width={640}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          selectedStudent && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerOpen(false);
                handleOpenEditModal(selectedStudent);
              }}
            >
              Chỉnh Sửa
            </Button>
          )
        }
      >
        {selectedStudent && (
          <div>
            {/* Header hồ sơ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                marginBottom: 20,
              }}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#06B6D4', fontSize: 28 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {selectedStudent.fullName}
                  </Typography.Title>
                  <Tag color="cyan" style={{ fontWeight: 600 }}>{selectedStudent.studentCode}</Tag>
                </div>
                <Space size="middle" wrap>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    @{selectedStudent.username}
                  </Typography.Text>
                  {selectedStudent.isActive ? (
                    <Badge status="success" text={<span style={{ color: '#16A34A', fontSize: 13 }}>Đang hoạt động</span>} />
                  ) : (
                    <Badge status="error" text={<span style={{ color: '#DC2626', fontSize: 13 }}>Đã khóa</span>} />
                  )}
                  {selectedStudent.trainingResult && (
                    <Tag color="green">{selectedStudent.trainingResult}</Tag>
                  )}
                </Space>
              </div>
            </div>

            {/* Nhóm 1: Thông tin học vụ & Đào tạo */}
            <Typography.Text strong style={{ fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <ReadOutlined style={{ color: '#06B6D4' }} /> 1. Thông Tin Học Vụ & Đào Tạo
            </Typography.Text>
            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 20 }}
              labelStyle={{ width: 170, fontWeight: 500, background: '#F8FAFC', color: '#475569' }}
            >
              <Descriptions.Item label="Mã học viên">
                <Typography.Text strong style={{ color: '#06B6D4' }}>{selectedStudent.studentCode}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đào tạo">
                {selectedStudent.trainingResult ? (
                  <Tag color="green">{selectedStudent.trainingResult}</Tag>
                ) : (
                  <Tag color="default">Đang theo học</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị / Cơ quan">
                {selectedStudent.workplace || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo hồ sơ">
                {selectedStudent.createdAt ? dayjs(selectedStudent.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            {/* Nhóm 2: Thông tin cá nhân & Định danh */}
            <Typography.Text strong style={{ fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <IdcardOutlined style={{ color: '#3B82F6' }} /> 2. Thông Tin Cá Nhân & Định Danh
            </Typography.Text>
            <Descriptions
              bordered
              size="small"
              column={1}
              labelStyle={{ width: 170, fontWeight: 500, background: '#F8FAFC', color: '#475569' }}
            >
              <Descriptions.Item label="Số CCCD / CMND">
                {selectedStudent.citizenId ? (
                  <Tag color="geekblue" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {selectedStudent.citizenId}
                  </Tag>
                ) : (
                  <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedStudent.dateOfBirth ? dayjs(selectedStudent.dateOfBirth).format('DD/MM/YYYY') : <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag color={selectedStudent.gender === 'Nữ' ? 'magenta' : 'blue'}>
                  {selectedStudent.gender || 'Chưa cập nhật'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedStudent.phoneNumber ? (
                  <Typography.Text strong style={{ color: '#0F172A' }}>{selectedStudent.phoneNumber}</Typography.Text>
                ) : (
                  <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">
                {selectedStudent.email || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ liên hệ">
                {selectedStudent.address || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StudentManagementPage;
