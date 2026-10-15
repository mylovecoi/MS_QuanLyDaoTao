import React, { useEffect, useState } from 'react';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
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
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';

interface RoomItem {
  id: string;
  name: string;
  address: string;
  capacity: number;
  facilities?: string;
  status: string;
  statusId: number;
  notes?: string;
  createdAt: string;
}

interface RoomFormValues {
  name: string;
  address: string;
  capacity: number;
  status: number;
  facilities?: string;
  notes?: string;
}

export const RoomsPage: React.FC = () => {
  const [data, setData] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>('');
  const debouncedKeyword = useDebounce(keyword, 350);
  const [statusFilter, setStatusFilter] = useState<number | 'ALL'>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm<RoomFormValues>();

  // Drawer Chi Tiết Phòng Học
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);

  const fetchRooms = async (
    targetPage = page,
    targetPageSize = pageSize,
    searchKw = debouncedKeyword,
    status = statusFilter
  ) => {
    setLoading(true);
    try {
      let url = `/api/catalog/rooms?pageNumber=${targetPage}&pageSize=${targetPageSize}`;
      if (searchKw && searchKw.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchKw.trim())}&keyword=${encodeURIComponent(searchKw.trim())}`;
      }
      if (status !== undefined && status !== null && status !== 'ALL') {
        url += `&status=${status}`;
      }

      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setData(res.data.data.items || []);
        setTotalCount(res.data.data.totalRecords ?? res.data.data.totalCount ?? 0);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách phòng học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, statusFilter]);

  useEffect(() => {
    fetchRooms(page, pageSize, debouncedKeyword, statusFilter);
  }, [page, pageSize, debouncedKeyword, statusFilter]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      capacity: 40,
    });
    setModalOpen(true);
  };

  const openEditModal = (record: RoomItem) => {
    setModalMode('edit');
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      capacity: record.capacity,
      status: record.statusId || (record.status === 'Available' ? 1 : record.status === 'Maintenance' ? 2 : 3),
      facilities: record.facilities,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.delete(`/api/catalog/rooms/${id}`);
      if (res.data?.success) {
        message.success('Đã xóa phòng học thành công!');
        fetchRooms();
      } else {
        message.error(res.data?.message || 'Xóa thất bại');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa phòng học');
    }
  };

  const handleFormSubmit = async (values: RoomFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/api/catalog/rooms', values);
        if (res.data?.success) {
          message.success('Tạo phòng học mới thành công!');
          setModalOpen(false);
          fetchRooms();
        } else {
          message.error(res.data?.message || 'Tạo phòng học thất bại');
        }
      } else if (editingId) {
        const res = await apiClient.put(`/api/catalog/rooms/${editingId}`, values);
        if (res.data?.success) {
          message.success('Cập nhật phòng học thành công!');
          setModalOpen(false);
          fetchRooms();
        } else {
          message.error(res.data?.message || 'Cập nhật thất bại');
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status: string, statusId?: number) => {
    if (statusId === 1 || status === 'Available') {
      return <Badge status="success" text={<span style={{ color: '#16A34A', fontWeight: 500 }}>Sẵn Sàng</span>} />;
    }
    if (statusId === 2 || status === 'Maintenance') {
      return <Badge status="warning" text={<span style={{ color: '#D97706', fontWeight: 500 }}>Bảo Trì</span>} />;
    }
    return <Badge status="error" text={<span style={{ color: '#DC2626', fontWeight: 500 }}>Tạm Khóa</span>} />;
  };

  const columns: ColumnsType<RoomItem> = [
    {
      title: 'Tên Phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <AppstoreOutlined style={{ color: '#1E40AF' }} />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Địa Chỉ / Khu Nhà',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (val) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {val} chỗ
        </Tag>
      ),
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: 'Trang Thiết Bị',
      dataIndex: 'facilities',
      key: 'facilities',
      render: (text) => text || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (val, record) => getStatusTag(val, record.statusId),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết phòng học">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#06B6D4' }} />}
              onClick={() => {
                setSelectedRoom(record);
                setDetailDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1E40AF' }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa?"
            description={`Bạn có chắc muốn xóa phòng ${record.name}?`}
            okText="Xóa"
            cancelText="Hủy"
            placement="left"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* CARD 1: Header Tiêu Chuẩn Kiến Trúc 3-Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: 16,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>
              Quản Lý Phòng Học & Cơ Sở Vật Chất
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Danh mục phòng học lý thuyết, thực hành máy tính và kiểm soát sức chứa, thiết bị
            </Typography.Text>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchRooms()}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                Thêm Phòng Mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* CARD 2: Filter Card Độc Lập */}
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
              placeholder="Tìm nhanh theo tên phòng, địa chỉ..."
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Sẵn Sàng', value: 1 },
                { label: 'Bảo Trì', value: 2 },
                { label: 'Tạm Khóa', value: 3 },
              ]}
              onChange={(val) => setStatusFilter(val)}
            />
          </Col>
        </Row>
      </Card>

      {/* CARD 3: Table Card Tràn Viền */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<RoomItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng cộng ${total} phòng học`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* Modal Form Nhập Liệu Tạo / Sửa */}
      <Modal
        open={modalOpen}
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#1E40AF' }} />
            <span>{modalMode === 'create' ? 'Thêm Phòng Học Mới' : 'Chỉnh Sửa Phòng Học'}</span>
          </Space>
        }
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy bỏ"
        onOk={form.submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên / Mã Phòng Học"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng học!' },
              { max: 100, message: 'Tên phòng không quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Ví dụ: P.301, Lab CNTT 02, Hội trường A" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa Chỉ / Khu Nhà"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí hoặc tòa nhà!' }]}
          >
            <Input placeholder="Ví dụ: Tòa H1 - Cơ sở 1, Tầng 3 Tòa B" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức Chứa (Chỗ ngồi)"
                rules={[
                  { required: true, message: 'Vui lòng nhập sức chứa!' },
                  { type: 'number', min: 1, max: 1000, message: 'Từ 1 đến 1000 chỗ' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="40" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng Thái Hoạt Động"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select
                  options={[
                    { label: 'Sẵn Sàng', value: 1 },
                    { label: 'Bảo Trì', value: 2 },
                    { label: 'Tạm Khóa', value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="facilities" label="Trang Thiết Bị Sẵn Có">
            <Input placeholder="Ví dụ: Máy chiếu, Điều hòa 2 chiều, 45 máy tính i5" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi Chú Thêm">
            <Input.TextArea rows={2} placeholder="Ghi chú về quản lý hoặc sử dụng phòng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Phòng Học */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#06B6D4' }} />
            <span>Chi Tiết Phòng Học</span>
          </Space>
        }
        width={580}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          selectedRoom && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerOpen(false);
                openEditModal(selectedRoom);
              }}
            >
              Chỉnh Sửa
            </Button>
          )
        }
      >
        {selectedRoom && (
          <div>
            {/* Header phòng học */}
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
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'rgba(30, 64, 175, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 28, color: '#1E40AF' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {selectedRoom.name}
                  </Typography.Title>
                  {getStatusTag(selectedRoom.status, selectedRoom.statusId)}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {selectedRoom.address}
                </Typography.Text>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <Typography.Text strong style={{ fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <CheckCircleOutlined style={{ color: '#16A34A' }} /> Thông Tin Cơ Sở Vật Chất
            </Typography.Text>
            <Descriptions
              bordered
              size="small"
              column={1}
              labelStyle={{ width: 170, fontWeight: 500, background: '#F8FAFC', color: '#475569' }}
            >
              <Descriptions.Item label="Tên phòng học">
                <Typography.Text strong>{selectedRoom.name}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí / Tòa nhà">
                {selectedRoom.address}
              </Descriptions.Item>
              <Descriptions.Item label="Sức chứa tối đa">
                <Tag color="blue" icon={<TeamOutlined />}>
                  {selectedRoom.capacity} chỗ ngồi
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                {getStatusTag(selectedRoom.status, selectedRoom.statusId)}
              </Descriptions.Item>
              <Descriptions.Item label="Trang thiết bị đào tạo">
                {selectedRoom.facilities || <Typography.Text type="secondary">Chưa cập nhật trang thiết bị</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú quản lý">
                {selectedRoom.notes || <Typography.Text type="secondary">Không có ghi chú</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khởi tạo">
                {selectedRoom.createdAt ? dayjs(selectedRoom.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoomsPage;

