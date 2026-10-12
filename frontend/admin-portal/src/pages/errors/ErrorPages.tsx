import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào chức năng này."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Trở về Trang chủ
          </Button>
        }
      />
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn yêu cầu không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Trở về Trang chủ
          </Button>
        }
      />
    </div>
  );
};
