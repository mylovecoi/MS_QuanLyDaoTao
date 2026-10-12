import React, { useEffect, useState } from 'react';
import {
  BankOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .get('/api/catalog/rooms?pageSize=100')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setTotalRooms(res.data.data.totalCount || res.data.data.items?.length || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Welcome Banner */}
      <Card style={{ borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Xin chào, {user?.fullName}! 👋
            </Typography.Title>
            <Typography.Text type="secondary">
              Chào mừng bạn đến với Cổng Quản Trị Hệ Thống Đào Tạo Microservices.
            </Typography.Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue" style={{ padding: '4px 12px', fontSize: 13 }}>
                Vai trò: {user?.role}
              </Tag>
              <Tag color="green" style={{ padding: '4px 12px', fontSize: 13 }}>
                <CheckCircleOutlined /> Hệ thống Hoạt động
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Thống kê nhanh */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Tổng Số Phòng Học"
              value={totalRooms}
              loading={loading}
              prefix={<BankOutlined style={{ color: '#1E40AF', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Phiên Bản Microservices"
              value="Phase 1 (v1.0)"
              prefix={<ThunderboltOutlined style={{ color: '#10B981', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Bảo Mật API"
              value="JWT Bearer + RBAC"
              prefix={<SafetyCertificateOutlined style={{ color: '#F59E0B', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Cổng Kết Nối Gateway"
              value="Port 7000 (YARP)"
              prefix={<UserOutlined style={{ color: '#3B82F6', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thao tác nhanh */}
      <Card title="🚀 Lối tắt chức năng nghiệp vụ" style={{ borderRadius: 12 }}>
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<BankOutlined />}
            size="large"
            onClick={() => navigate('/rooms')}
          >
            Vào Quản Lý Phòng Học
          </Button>
          <Button size="large" onClick={() => navigate('/users')}>
            Quản Lý Người Dùng
          </Button>
        </Space>
      </Card>
    </Space>
  );
};
