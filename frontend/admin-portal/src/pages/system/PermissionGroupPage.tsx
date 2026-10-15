import React, { useCallback, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  KeyOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Empty,
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
import { apiClient } from '../../api/client';
import { getFullAvatarUrl } from '../../utils/url';

interface PermissionGroupItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

interface MatrixItem {
  menuId: string;
  menuCode: string;
  menuTitle: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublic: boolean;
}

interface GroupMemberItem {
  userId: string;
  staffId?: string;
  staffCode?: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  departmentName?: string;
  position?: string;
}

export const PermissionGroupPage: React.FC = () => {
  const [data, setData] = useState<PermissionGroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal tạo / sửa nhóm quyền
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroupItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Drawer Ma trận quyền
  const [matrixDrawerOpen, setMatrixDrawerOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<PermissionGroupItem | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixItem[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Drawer Danh sách Thành viên trong Nhóm
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<PermissionGroupItem | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Modal Gán nhanh thành viên vào Nhóm
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<GroupMemberItem[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);

  // Fetch danh sách nhóm quyền
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/auth/permission-groups');
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        message.error(res.data?.message || 'Không thể tải danh sách nhóm quyền');
      }
    } catch {
      message.error('Lỗi khi tải danh sách nhóm quyền');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch danh sách thành viên thuộc nhóm
  const fetchGroupMembers = async (groupId: string) => {
    setMembersLoading(true);
    try {
      const res = await apiClient.get(`/api/auth/permission-groups/${groupId}/members`);
      if (res.data?.success) {
        setMembers(res.data.data || []);
      } else {
        message.error(res.data?.message || 'Không thể tải danh sách thành viên');
      }
    } catch {
      message.error('Lỗi khi kết nối lấy danh sách cán bộ');
    } finally {
      setMembersLoading(false);
    }
  };

  // Mở Drawer Thành viên
  const handleOpenMembersDrawer = (group: PermissionGroupItem) => {
    setSelectedGroupForMembers(group);
    setMembersDrawerOpen(true);
    fetchGroupMembers(group.id);
  };

  // Mở Modal Gán nhanh thành viên
  const handleOpenAddMembersModal = async () => {
    if (!selectedGroupForMembers) return;
    setIsAddMembersModalOpen(true);
    setSelectedUserIds([]);
    setAvailableLoading(true);
    try {
      const res = await apiClient.get(`/api/auth/permission-groups/${selectedGroupForMembers.id}/available-users`);
      if (res.data?.success) {
        setAvailableUsers(res.data.data || []);
      } else {
        message.error(res.data?.message || 'Không thể tải danh sách cán bộ');
      }
    } catch {
      message.error('Lỗi khi tải danh sách cán bộ khả dụng');
    } finally {
      setAvailableLoading(false);
    }
  };

  // Submit gán thành viên
  const handleAddMembersSubmit = async () => {
    if (!selectedGroupForMembers) return;
    if (selectedUserIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một cán bộ');
      return;
    }
    setAddingMembers(true);
    try {
      const res = await apiClient.post(`/api/auth/permission-groups/${selectedGroupForMembers.id}/members`, {
        userIds: selectedUserIds,
      });
      if (res.data?.success) {
        message.success(`Đã thêm ${selectedUserIds.length} cán bộ vào nhóm thành công!`);
        setIsAddMembersModalOpen(false);
        fetchGroupMembers(selectedGroupForMembers.id);
        fetchGroups();
      } else {
        message.error(res.data?.message || 'Không thể gán thành viên');
      }
    } catch {
      message.error('Lỗi khi thêm cán bộ vào nhóm');
    } finally {
      setAddingMembers(false);
    }
  };

  // Gỡ thành viên khỏi nhóm
  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroupForMembers) return;
    try {
      const res = await apiClient.delete(`/api/auth/permission-groups/${selectedGroupForMembers.id}/members/${userId}`);
      if (res.data?.success) {
        message.success('Đã gỡ cán bộ khỏi nhóm quyền thành công!');
        fetchGroupMembers(selectedGroupForMembers.id);
        fetchGroups();
      } else {
        message.error(res.data?.message || 'Không thể gỡ cán bộ khỏi nhóm');
      }
    } catch {
      message.error('Lỗi khi gỡ cán bộ khỏi nhóm');
    }
  };

  // Mở modal tạo nhóm mới
  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  // Mở modal sửa nhóm
  const handleOpenEditModal = (record: PermissionGroupItem) => {
    setEditingGroup(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

  // Submit modal
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingGroup) {
        const res = await apiClient.put(`/api/auth/permission-groups/${editingGroup.id}`, values);
        if (res.data?.success) {
          message.success('Cập nhật nhóm quyền thành công!');
          setIsModalOpen(false);
          fetchGroups();
        } else {
          message.error(res.data?.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await apiClient.post('/api/auth/permission-groups', values);
        if (res.data?.success) {
          message.success('Thêm nhóm quyền thành công!');
          setIsModalOpen(false);
          fetchGroups();
        } else {
          message.error(res.data?.message || 'Thêm mới thất bại');
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

  // Xóa nhóm quyền
  const handleDelete = async (record: PermissionGroupItem) => {
    try {
      const res = await apiClient.delete(`/api/auth/permission-groups/${record.id}`);
      if (res.data?.success) {
        message.success('Xóa nhóm quyền thành công!');
        fetchGroups();
      } else {
        message.error(res.data?.message || 'Không thể xóa nhóm quyền');
      }
    } catch {
      message.error('Lỗi khi xóa nhóm quyền');
    }
  };

  // Mở Drawer Ma trận quyền
  const handleOpenMatrixDrawer = async (group: PermissionGroupItem) => {
    setCurrentGroup(group);
    setMatrixDrawerOpen(true);
    setMatrixLoading(true);

    try {
      const res = await apiClient.get(`/api/auth/permission-groups/${group.id}/matrix`);
      if (res.data?.success) {
        setMatrixData(res.data.data || []);
      } else {
        message.error(res.data?.message || 'Không thể tải ma trận quyền');
      }
    } catch {
      message.error('Lỗi khi tải ma trận quyền');
    } finally {
      setMatrixLoading(false);
    }
  };

  // Thay đổi từng ô checkbox
  const handleCheckboxChange = (
    menuId: string,
    field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canApprove' | 'canPublic',
    value: boolean
  ) => {
    setMatrixData((prev) =>
      prev.map((item) => {
        if (item.menuId === menuId) {
          const updated = { ...item, [field]: value };
          if (field === 'canView' && !value) {
            updated.canCreate = false;
            updated.canEdit = false;
            updated.canDelete = false;
            updated.canApprove = false;
            updated.canPublic = false;
          }
          if (field !== 'canView' && value) {
            updated.canView = true;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleToggleRowAll = (menuId: string, checkAll: boolean) => {
    setMatrixData((prev) =>
      prev.map((item) =>
        item.menuId === menuId
          ? {
            ...item,
            canView: checkAll,
            canCreate: checkAll,
            canEdit: checkAll,
            canDelete: checkAll,
            canApprove: checkAll,
            canPublic: checkAll,
          }
          : item
      )
    );
  };

  const handleToggleColumnAll = (
    field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canApprove' | 'canPublic',
    checkAll: boolean
  ) => {
    setMatrixData((prev) =>
      prev.map((item) => {
        const updated = { ...item, [field]: checkAll };
        if (field !== 'canView' && checkAll) {
          updated.canView = true;
        }
        return updated;
      })
    );
  };

  // Lưu ma trận phân quyền
  const handleSaveMatrix = async () => {
    if (!currentGroup) return;
    setSavingMatrix(true);
    try {
      const payload = {
        permissions: matrixData.map((m) => ({
          menuId: m.menuId,
          canView: m.canView,
          canCreate: m.canCreate,
          canEdit: m.canEdit,
          canDelete: m.canDelete,
          canApprove: m.canApprove,
          canPublic: m.canPublic,
        })),
      };

      const res = await apiClient.put(`/api/auth/permission-groups/${currentGroup.id}/matrix`, payload);
      if (res.data?.success) {
        message.success(`Đã lưu ma trận phân quyền cho nhóm [${currentGroup.name}] thành công!`);
        setMatrixDrawerOpen(false);
      } else {
        message.error(res.data?.message || 'Lưu ma trận phân quyền thất bại');
      }
    } catch {
      message.error('Lỗi khi lưu phân quyền');
    } finally {
      setSavingMatrix(false);
    }
  };

  const groupColumns = [
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: '#8B5CF6', fontSize: 16 }} />
          <Typography.Text strong style={{ fontSize: 14 }}>
            {name}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Mô tả vai trò',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Số thành viên',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 160,
      align: 'center' as const,
      render: (count: number, record: PermissionGroupItem) => (
        <Tooltip title="Nhấp để xem & quản lý cán bộ trong nhóm này">
          <Tag
            color="geekblue"
            icon={<TeamOutlined />}
            style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13, borderRadius: 6 }}
            onClick={() => handleOpenMembersDrawer(record)}
          >
            {count} cán bộ
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean) =>
        isActive ? <Badge status="success" text="Áp dụng" /> : <Badge status="default" text="Tạm dừng" />,
    },
    {
      title: 'Thao tác & Phân quyền',
      key: 'actions',
      width: 260,
      align: 'center' as const,
      render: (_: unknown, record: PermissionGroupItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<KeyOutlined />}
            style={{ background: '#8B5CF6', borderColor: '#8B5CF6' }}
            onClick={() => handleOpenMatrixDrawer(record)}
          >
            Phân quyền
          </Button>

          <Tooltip title="Quản lý thành viên">
            <Button
              size="small"
              icon={<TeamOutlined style={{ color: '#10B981' }} />}
              onClick={() => handleOpenMembersDrawer(record)}
            >
              Thành viên
            </Button>
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
            title="Xóa nhóm quyền"
            description="Bạn có chắc chắn muốn xóa nhóm quyền này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const matrixColumns = [
    {
      title: 'Menu / Chức Năng',
      dataIndex: 'menuTitle',
      key: 'menuTitle',
      width: 280,
      render: (title: string, record: MatrixItem) => {
        const isGroup = !record.parentId;
        return (
          <div style={{ paddingLeft: isGroup ? 0 : 26 }}>
            {isGroup ? (
              <Space size={6} align="center">
                <FolderOpenOutlined style={{ color: '#F59E0B', fontSize: 16 }} />
                <Typography.Text strong style={{ fontSize: 13.5, color: '#0F172A' }}>
                  {title}
                </Typography.Text>
                <Tag color="gold" style={{ fontSize: 10, lineHeight: '18px', padding: '0 4px', margin: 0 }}>
                  Nhóm
                </Tag>
              </Space>
            ) : (
              <Space size={6} align="center">
                <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>└──</span>
                <MenuOutlined style={{ color: '#3B82F6', fontSize: 12 }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
              </Space>
            )}
            <div style={{ fontSize: 11, color: '#94A3B8', paddingLeft: isGroup ? 22 : 40 }}>
              {record.menuCode}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tất cả',
      key: 'all',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: MatrixItem) => {
        const isAll =
          record.canView &&
          record.canCreate &&
          record.canEdit &&
          record.canDelete &&
          record.canApprove &&
          record.canPublic;
        return (
          <Checkbox
            checked={isAll}
            onChange={(e) => handleToggleRowAll(record.menuId, e.target.checked)}
          />
        );
      },
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Xem</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canView', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canView',
      key: 'canView',
      width: 75,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canView', e.target.checked)}
        />
      ),
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Thêm</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canCreate', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canCreate',
      key: 'canCreate',
      width: 75,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canCreate', e.target.checked)}
        />
      ),
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Sửa</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canEdit', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canEdit',
      key: 'canEdit',
      width: 75,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canEdit', e.target.checked)}
        />
      ),
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Xóa</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canDelete', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canDelete',
      key: 'canDelete',
      width: 75,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canDelete', e.target.checked)}
        />
      ),
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Duyệt</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canApprove', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canApprove',
      key: 'canApprove',
      width: 75,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canApprove', e.target.checked)}
        />
      ),
    },
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>Công khai</div>
          <Checkbox
            onChange={(e) => handleToggleColumnAll('canPublic', e.target.checked)}
          />
        </div>
      ),
      dataIndex: 'canPublic',
      key: 'canPublic',
      width: 85,
      align: 'center' as const,
      render: (val: boolean, record: MatrixItem) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleCheckboxChange(record.menuId, 'canPublic', e.target.checked)}
        />
      ),
    },
  ];

  return (
    <div>
      {/* CARD 1: Header Tiêu chuẩn Kiến trúc 3-Card */}
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
              Quản Lý Nhóm Quyền & Phân Quyền Cán Bộ
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Thiết lập các vai trò quản trị, phân quyền chi tiết 6 tác vụ trên hệ thống Menu và phân bổ cán bộ
            </Typography.Text>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchGroups}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                Thêm Nhóm Quyền
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* CARD 2: Bảng danh sách nhóm quyền tràn viền */}
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
          columns={groupColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Modal Thêm mới / Sửa nhóm quyền */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#8B5CF6' }} />
            <span>{editingGroup ? 'Chỉnh Sửa Nhóm Quyền' : 'Thêm Mới Nhóm Quyền'}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingGroup ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên nhóm quyền"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm quyền' }]}
          >
            <Input placeholder="Ví dụ: Giảng viên bộ môn, Ban giám hiệu, Quản lý học vụ" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả vai trò">
            <Input.TextArea rows={3} placeholder="Mô tả phạm vi quyền hạn và trách nhiệm..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Ma trận Phân quyền 6 checkbox */}
      <Drawer
        title={
          <Space>
            <KeyOutlined style={{ color: '#8B5CF6' }} />
            <span>
              Ma Trận Phân Quyền: <b>{currentGroup?.name}</b>
            </span>
          </Space>
        }
        width={920}
        open={matrixDrawerOpen}
        onClose={() => setMatrixDrawerOpen(false)}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={savingMatrix}
            onClick={handleSaveMatrix}
            style={{ background: '#8B5CF6', borderColor: '#8B5CF6' }}
          >
            Lưu Ma Trận Quyền
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
            Tích chọn các quyền được phép thực hiện trên từng Menu. Hệ thống sẽ tự động bật quyền Xem khi cấp các
            quyền tác vụ (Thêm, Sửa, Xóa, Duyệt, Công khai).
          </Typography.Paragraph>
        </div>

        <Table
          rowKey="menuId"
          columns={matrixColumns}
          dataSource={matrixData}
          loading={matrixLoading}
          pagination={false}
          size="middle"
          scroll={{ y: 'calc(100vh - 220px)' }}
        />
      </Drawer>

      {/* Drawer Danh Sách Cán Bộ Thuộc Nhóm Quyền */}
      <Drawer
        title={
          <Space>
            <TeamOutlined style={{ color: '#3B82F6', fontSize: 18 }} />
            <span>
              Cán Bộ Thuộc Nhóm: <b>{selectedGroupForMembers?.name}</b> ({members.length} người)
            </span>
          </Space>
        }
        width={780}
        open={membersDrawerOpen}
        onClose={() => setMembersDrawerOpen(false)}
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenAddMembersModal}
          >
            + Thêm Thành Viên
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Danh sách cán bộ được phân quyền theo nhóm này. Bạn có thể thêm nhanh cán bộ hoặc gỡ cán bộ khỏi nhóm.
          </Typography.Text>
        </div>

        <Table
          rowKey="userId"
          loading={membersLoading}
          dataSource={members}
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} cán bộ` }}
          columns={[
            {
              title: 'Cán Bộ',
              key: 'staffInfo',
              render: (_: unknown, record: GroupMemberItem) => (
                <Space>
                  <Avatar
                    src={getFullAvatarUrl(record.avatarUrl)}
                    icon={!record.avatarUrl && <UserOutlined />}
                    style={{ backgroundColor: '#8B5CF6' }}
                  />
                  <div>
                    <Typography.Text strong style={{ fontSize: 13.5 }}>
                      {record.fullName}
                    </Typography.Text>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {record.staffCode ? <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', marginRight: 4 }}>{record.staffCode}</Tag> : null}
                      {record.email}
                    </div>
                  </div>
                </Space>
              ),
            },
            {
              title: 'Phòng ban / Bộ môn',
              dataIndex: 'departmentName',
              key: 'departmentName',
              render: (dep: string) => dep || <Typography.Text type="secondary">—</Typography.Text>,
            },
            {
              title: 'Chức vụ',
              dataIndex: 'position',
              key: 'position',
              render: (pos: string) => pos ? <Tag color="purple">{pos}</Tag> : <Typography.Text type="secondary">—</Typography.Text>,
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 90,
              align: 'center' as const,
              render: (_: unknown, record: GroupMemberItem) => (
                <Popconfirm
                  placement="left"
                  title="Gỡ khỏi nhóm quyền"
                  description={`Bạn có chắc muốn gỡ cán bộ ${record.fullName} khỏi nhóm này?`}
                  onConfirm={() => handleRemoveMember(record.userId)}
                  okText="Gỡ"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Gỡ khỏi nhóm">
                    <Button type="text" danger icon={<UserDeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Drawer>

      {/* Modal Chọn Cán Bộ Thêm Vào Nhóm */}
      <Modal
        title={
          <Space>
            <UserAddOutlined style={{ color: '#3B82F6' }} />
            <span>Thêm Cán Bộ Vào Nhóm [{selectedGroupForMembers?.name}]</span>
          </Space>
        }
        open={isAddMembersModalOpen}
        onCancel={() => setIsAddMembersModalOpen(false)}
        onOk={handleAddMembersSubmit}
        confirmLoading={addingMembers}
        okText="Thêm vào nhóm"
        cancelText="Đóng"
        destroyOnClose
        width={560}
      >
        <div style={{ marginTop: 12, marginBottom: 16 }}>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
            Chọn một hoặc nhiều cán bộ để phân công vào nhóm quyền này:
          </Typography.Paragraph>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Tìm kiếm và chọn cán bộ theo tên, mã hoặc email..."
            loading={availableLoading}
            value={selectedUserIds}
            onChange={(vals) => setSelectedUserIds(vals)}
            optionFilterProp="label"
            notFoundContent={availableLoading ? undefined : <Empty description="Không có cán bộ khả dụng" />}
            options={availableUsers.map((u) => ({
              value: u.userId,
              label: `${u.fullName} (${u.staffCode || 'Chưa có mã'} - ${u.email})`,
            }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PermissionGroupPage;

