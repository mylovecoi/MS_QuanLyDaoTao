import React from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Tooltip title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'} placement="bottom">
      <Button
        type="text"
        shape="circle"
        size="large"
        onClick={toggleDarkMode}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        icon={
          isDarkMode ? (
            <SunOutlined style={{ color: '#F59E0B', fontSize: 20 }} />
          ) : (
            <MoonOutlined style={{ color: '#475569', fontSize: 20 }} />
          )
        }
      />
    </Tooltip>
  );
};
