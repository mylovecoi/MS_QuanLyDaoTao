import React, { useEffect, useState } from 'react';
import {
  IdcardOutlined,
  InboxOutlined,
  KeyOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Menu,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { VIETNAM_BANKS } from '../../constants/banks';
import { getFullAvatarUrl } from '../../utils/url';

export const AccountSettingsPage: React.FC = () => {
  const { updateUserAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<'base' | 'security' | 'job'>('base');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [baseForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/auth/profile/me');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setProfile(data);
        baseForm.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : undefined,
          gender: data.gender,
          address: data.address,
          citizenId: data.citizenId,
          issueDate: data.issueDate ? dayjs(data.issueDate) : undefined,
          issuePlace: data.issuePlace,
          bankAccount: data.bankAccount,
          bankName: data.bankName,
          socialInsuranceNumber: data.socialInsuranceNumber,
          healthInsuranceNumber: data.healthInsuranceNumber,
          academicRank: data.academicRank,
          professionalLevel: data.professionalLevel,
          foreignLanguageLevel: data.foreignLanguageLevel,
          position: data.position,
        });
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveBase = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        issueDate: values.issueDate ? values.issueDate.toISOString() : null,
      };
      const res = await apiClient.put('/api/auth/profile/me', payload);
      if (res.data?.success) {
        message.success('Cập nhật hồ sơ cá nhân thành công!');
        fetchProfile();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.post('/api/auth/profile/change-password', values);
      if (res.data?.success) {
        message.success('Đổi mật khẩu thành công!');
        securityForm.resetFields();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (avatarFileList.length === 0) {
      message.warning('Vui lòng kéo thả hoặc chọn file ảnh đại diện.');
      return;
    }

    const file = avatarFileList[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    try {
      // 1. Tải ảnh lên Storage Microservice (thông qua Gateway port 7000)
      const storageRes = await apiClient.post('/api/storage/upload?folder=avatars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (storageRes.data?.success) {
        const fileUrl = storageRes.data.data.fileUrl; // Ví dụ: /uploads/avatars/xxxx.webp

        // 2. Lưu đường dẫn avatar vào Profile người dùng
        const updateRes = await apiClient.post('/api/auth/profile/avatar', {
          avatarUrl: fileUrl,
        });

        if (updateRes.data?.success) {
          message.success('Cập nhật ảnh đại diện thành công!');
          updateUserAvatar(fileUrl);
          setAvatarModalOpen(false);
          setAvatarFileList([]);
          setAvatarPreview('');
          fetchProfile();
        } else {
          message.error(updateRes.data?.message || 'Không thể lưu thông tin ảnh đại diện.');
        }
      } else {
        message.error(storageRes.data?.message || 'Tải ảnh lên máy chủ thất bại.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi trong quá trình tải ảnh lên.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải thông tin hồ sơ..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Hồ Sơ & Cài Đặt Tài Khoản
        </Typography.Title>
        <Typography.Text type="secondary">
          Quản lý thông tin cá nhân, hồ sơ công tác và bảo mật tài khoản (Theo chuẩn Ant Design Pro)
        </Typography.Text>
      </Card>

      <Card style={{ borderRadius: 12, minHeight: 600 }} bodyStyle={{ padding: 0 }}>
        <Row gutter={0}>
          {/* CỘT TRÁI: Menu Cài Đặt (220px) */}
          <Col xs={24} md={6} style={{ borderRight: '1px solid #f0f0f0', padding: '16px 0' }}>
            <div style={{ textAlign: 'center', padding: '12px 16px 24px' }}>
              <Avatar
                size={96}
                src={getFullAvatarUrl(profile?.avatar)}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1E40AF', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Typography.Title level={5} style={{ margin: 0 }}>
                {profile?.fullName || profile?.username}
              </Typography.Title>
              <div style={{ marginTop: 6 }}>
                <Tag color={profile?.isSuperAdmin ? 'gold' : profile?.userType === 1 ? 'blue' : 'purple'}>
                  {profile?.isSuperAdmin ? 'Super Admin' : profile?.userType === 1 ? 'Cán Bộ Đào Tạo' : 'Học Viên'}
                </Tag>
              </div>
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{ marginTop: 12 }}
                onClick={() => setAvatarModalOpen(true)}
              >
                Đổi ảnh đại diện
              </Button>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key as any)}
              style={{ borderRight: 'none' }}
              items={[
                {
                  key: 'base',
                  icon: <UserOutlined />,
                  label: 'Thông Tin Cơ Bản',
                },
                {
                  key: 'security',
                  icon: <KeyOutlined />,
                  label: 'Bảo Mật Tài Khoản',
                },
                {
                  key: 'job',
                  icon: <IdcardOutlined />,
                  label: profile?.userType === 1 ? 'Hồ Sơ Cán Bộ' : 'Hồ Sơ Học Viên',
                },
              ]}
            />
          </Col>

          {/* CỘT PHẢI: Form Chi Tiết */}
          <Col xs={24} md={18} style={{ padding: '24px 32px' }}>
            {activeTab === 'base' && (
              <div>
                <Typography.Title level={4} style={{ marginBottom: 20 }}>
                  Thông Tin Cơ Bản
                </Typography.Title>
                <Form
                  form={baseForm}
                  layout="vertical"
                  onFinish={handleSaveBase}
                  requiredMark="optional"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="email" label="Email">
                        <Input placeholder="example@qldaotao.edu.vn" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phoneNumber"
                        label="Số Điện Thoại"
                        rules={[
                          {
                            pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                            message: 'Số điện thoại Việt Nam không hợp lệ (gồm 10 số, đầu 03, 05, 07, 08, 09)',
                          },
                        ]}
                      >
                        <Input placeholder="0912 345 678" maxLength={11} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="dateOfBirth" label="Ngày Sinh">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="gender" label="Giới Tính">
                        <Select
                          options={[
                            { label: 'Nam', value: 'Nam' },
                            { label: 'Nữ', value: 'Nữ' },
                            { label: 'Khác', value: 'Khác' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="citizenId"
                        label="Số CCCD / CMND"
                        rules={[
                          {
                            pattern: /^(\d{9}|\d{12})$/,
                            message: 'Số CCCD phải gồm đúng 12 chữ số (hoặc CMND cũ 9 chữ số)',
                          },
                        ]}
                      >
                        <Input placeholder="001200000000" maxLength={12} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="issueDate" label="Ngày Cấp CCCD">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="issuePlace" label="Nơi Cấp">
                        <Input placeholder="Cục Cảnh sát QLHC về TTXH" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="address" label="Địa Chỉ Thường Trú">
                        <Input placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider titlePlacement="left">Tài Khoản Ngân Hàng & Bảo Hiểm</Divider>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="bankAccount"
                        label="Số Tài Khoản"
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
                    <Col xs={24} sm={12}>
                      <Form.Item name="bankName" label="Tên Ngân Hàng">
                        <Select
                          showSearch
                          allowClear
                          placeholder="Chọn ngân hàng"
                          options={VIETNAM_BANKS}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="socialInsuranceNumber"
                        label="Mã Số BHXH"
                        rules={[
                          {
                            pattern: /^\d{10}$/,
                            message: 'Mã số BHXH Việt Nam gồm đúng 10 chữ số',
                          },
                        ]}
                      >
                        <Input placeholder="10 chữ số BHXH" maxLength={10} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="healthInsuranceNumber"
                        label="Số Thẻ BHYT"
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

                  <Form.Item style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                      style={{ background: '#1E40AF' }}
                    >
                      Lưu Thay Đổi
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ maxWidth: 500 }}>
                <Typography.Title level={4} style={{ marginBottom: 20 }}>
                  Đổi Mật Khẩu Đăng Nhập
                </Typography.Title>
                <Form
                  form={securityForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Mật Khẩu Hiện Tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu đang dùng" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Mật Khẩu Mới"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                    ]}
                  >
                    <Input.Password placeholder="Mật khẩu mới tối thiểu 6 ký tự" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Xác Nhận Mật Khẩu Mới"
                    rules={[{ required: true, message: 'Vui lòng xác nhận lại mật khẩu' }]}
                  >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 20 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<KeyOutlined />}
                      loading={saving}
                      style={{ background: '#1E40AF' }}
                    >
                      Cập Nhật Mật Khẩu
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}

            {activeTab === 'job' && (
              <div>
                <Typography.Title level={4} style={{ marginBottom: 20 }}>
                  {profile?.userType === 1 ? 'Thông Tin Hồ Sơ Cán Bộ' : 'Thông Tin Hồ Sơ Học Viên'}
                </Typography.Title>

                {profile?.userType === 1 ? (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Mã Số Cán Bộ:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.staffInfo?.staffCode || 'Chưa cập nhật'}
                          </Typography.Title>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Phân Loại Cán Bộ:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.staffInfo?.staffTypeName || 'Cán bộ'}
                          </Typography.Title>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Chức Danh Ký Duyệt:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.staffInfo?.signTitle || 'Chưa thiết lập'}
                          </Typography.Title>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Họ Tên Ký Hiển Thị:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.staffInfo?.signFullName || profile?.fullName}
                          </Typography.Title>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Mã Số Học Viên / Sinh Viên:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.studentInfo?.studentCode || 'Chưa cập nhật'}
                          </Typography.Title>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card size="small" style={{ background: '#F8FAFC', borderRadius: 8 }}>
                          <Typography.Text type="secondary">Cơ Quan Cử Đi Học:</Typography.Text>
                          <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                            {profile?.studentInfo?.workplace || 'Học viên tự do'}
                          </Typography.Title>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Modal Cập Nhật Avatar Dùng Upload.Dragger Kéo Thả */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1E40AF' }} />
            <span>Cập Nhật Ảnh Đại Diện</span>
          </Space>
        }
        open={avatarModalOpen}
        onOk={handleUpdateAvatar}
        onCancel={() => {
          setAvatarModalOpen(false);
          setAvatarFileList([]);
          setAvatarPreview('');
        }}
        confirmLoading={uploadingAvatar}
        okText="Lưu Ảnh"
        cancelText="Hủy"
        width={500}
        destroyOnClose
      >
        <div style={{ marginTop: 12 }}>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
            Kéo thả hoặc nhấp để chọn ảnh từ máy tính (Hỗ trợ định dạng .PNG, .JPG, .WEBP - Dung lượng tối đa 2MB).
          </Typography.Paragraph>

          {avatarPreview ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Avatar
                size={120}
                src={avatarPreview}
                style={{
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  border: '3px solid #1E40AF',
                  marginBottom: 16,
                }}
              />
              <div>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setAvatarFileList([]);
                    setAvatarPreview('');
                  }}
                >
                  Chọn ảnh khác
                </Button>
              </div>
            </div>
          ) : (
            <Upload.Dragger
              name="file"
              multiple={false}
              fileList={avatarFileList}
              beforeUpload={(file) => {
                const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                if (!isImage) {
                  message.error('Chỉ hỗ trợ file ảnh định dạng JPG, PNG hoặc WEBP!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Dung lượng ảnh phải nhỏ hơn 2MB!');
                  return Upload.LIST_IGNORE;
                }

                // Đọc file để tạo preview ngay lập tức
                const reader = new FileReader();
                reader.onload = (e) => {
                  setAvatarPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);

                setAvatarFileList([file]);
                return false; // Ngăn không cho antd tự upload ngầm
              }}
              onRemove={() => {
                setAvatarFileList([]);
                setAvatarPreview('');
              }}
              showUploadList={false}
              style={{
                padding: '24px 0',
                background: '#F8FAFC',
                border: '1.5px dashed #94A3B8',
                borderRadius: 8,
              }}
            >
              <p className="ant-upload-drag-icon" style={{ marginBottom: 12 }}>
                <InboxOutlined style={{ fontSize: 48, color: '#1E40AF' }} />
              </p>
              <p className="ant-upload-text" style={{ fontWeight: 500, fontSize: 14 }}>
                Kéo thả ảnh đại diện vào đây hoặc nhấn để duyệt file
              </p>
            </Upload.Dragger>
          )}
        </div>
      </Modal>
    </div>
  );
};
