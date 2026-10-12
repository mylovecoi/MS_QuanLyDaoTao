import React, { useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';

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
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm<RoomFormValues>();
  const [searchForm] = Form.useForm();

  const fetchRooms = async (
    targetPage = page,
    targetPageSize = pageSize,
    searchKw = keyword,
    status = statusFilter
  ) => {
    setLoading(true);
    try {
      let url = `/api/catalog/rooms?pageNumber=${targetPage}&pageSize=${targetPageSize}`;
      if (searchKw) url += `&keyword=${encodeURIComponent(searchKw)}`;
      if (status !== undefined) url += `&status=${status}`;

      const res = await apiClient.get(url);
      if (res.data?.success && res.data?.data) {
        setData(res.data.data.items || []);
        setTotalCount(res.data.data.totalCount || 0);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách phòng học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, pageSize]);

  const handleSearch = (values: { keyword?: string; status?: number }) => {
    setPage(1);
    setKeyword(values.keyword || '');
    setStatusFilter(values.status);
    fetchRooms(1, pageSize, values.keyword || '', values.status);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setPage(1);
    setKeyword('');
    setStatusFilter(undefined);
    fetchRooms(1, pageSize, '', undefined);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1, // Sẵn sàng
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
      return <Tag color="success">Sẵn Sàng</Tag>;
    }
    if (statusId === 2 || status === 'Maintenance') {
      return <Tag color="warning">Bảo Trì</Tag>;
    }
    return <Tag color="error">Tạm Khóa</Tag>;
  };

  const columns: ColumnsType<RoomItem> = [
    {
      title: 'Tên Phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
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
      render: (val) => `${val} chỗ`,
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: 'Trang Thiết Bị',
      dataIndex: 'facilities',
      key: 'facilities',
      render: (text) => text || '—',
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
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
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
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa phòng">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* TẦNG 1: Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            Quản Lý Phòng Học
          </Typography.Title>
          <Typography.Text type="secondary">
            Quản lý danh mục cơ sở vật chất, phòng học lý thuyết và phòng thực hành
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="middle"
          onClick={openCreateModal}
          style={{ background: '#1E40AF' }}
        >
          Thêm Phòng Mới
        </Button>
      </div>

      {/* TẦNG 2: Search & Filter Card */}
      <Card size="small" style={{ borderRadius: 10 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ gap: '8px 16px' }}
        >
          <Form.Item name="keyword" style={{ margin: 0 }}>
            <Input.Search
              placeholder="Tìm theo tên phòng, địa chỉ..."
              allowClear
              onSearch={() => searchForm.submit()}
              style={{ width: 280 }}
            />
          </Form.Item>
          <Form.Item name="status" style={{ margin: 0 }}>
            <Select
              placeholder="Chọn trạng thái"
              allowClear
              style={{ width: 170 }}
              options={[
                { label: 'Sẵn Sàng', value: 1 },
                { label: 'Bảo Trì', value: 2 },
                { label: 'Tạm Khóa', value: 3 },
              ]}
              onChange={() => searchForm.submit()}
            />
          </Form.Item>
          <Form.Item style={{ margin: 0 }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Làm mới
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* TẦNG 3: Data Table */}
      <Card style={{ borderRadius: 10, padding: 0 }} styles={{ body: { padding: 0 } }}>
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
            showTotal: (total) => `Tổng số: ${total} phòng học`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* TẦNG 4: Modal Form Nhập Liệu */}
      <Modal
        open={modalOpen}
        title={modalMode === 'create' ? '🏢 Thêm Phòng Học Mới' : '✏️ Chỉnh Sửa Phòng Học'}
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
            label="Địa Chỉ / Tòa Nhà"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí hoặc tòa nhà!' }]}
          >
            <Input placeholder="Ví dụ: Tòa H1 - Cơ sở 1, Tầng 3 Tòa B" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="capacity"
              label="Sức Chứa (Người)"
              rules={[
                { required: true, message: 'Vui lòng nhập sức chứa!' },
                { type: 'number', min: 1, max: 1000, message: 'Từ 1 đến 1000 chỗ ngồi' },
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="40" />
            </Form.Item>

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
          </div>

          <Form.Item name="facilities" label="Trang Thiết Bị Sẵn Có">
            <Input placeholder="Ví dụ: Máy chiếu, Điều hòa 2 chiều, 45 máy tính i5" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi Chú Thêm">
            <Input.TextArea rows={2} placeholder="Ghi chú về quản lý hoặc sử dụng phòng..." />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
