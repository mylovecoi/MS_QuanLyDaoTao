import type { ThemeConfig } from 'antd';

export const getThemeConfig = (isDark: boolean): ThemeConfig => ({
  token: {
    colorPrimary: '#1E40AF',        // Xanh Navy chuẩn Giáo dục & Học thuật
    colorSuccess: '#10B981',        // Xanh lá (Đậu môn, Sẵn sàng)
    colorWarning: '#F59E0B',        // Vàng cam (Bảo trì, Cảnh báo)
    colorError: '#EF4444',          // Đỏ (Khóa, Lỗi)
    colorInfo: '#3B82F6',           // Xanh biển
    borderRadius: 8,                // Bo góc hiện đại
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgLayout: isDark ? '#0F172A' : '#F8FAFC',
    colorBgContainer: isDark ? '#1E293B' : '#FFFFFF',
  },
  components: {
    Table: {
      headerBg: isDark ? '#334155' : '#F1F5F9',
      headerColor: isDark ? '#F8FAFC' : '#1E293B',
      rowHoverBg: isDark ? '#1E293B' : '#F8FAFC',
    },
    Card: {
      boxShadowTertiary: isDark 
        ? '0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)' 
        : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    Menu: {
      itemSelectedColor: '#1E40AF',
      itemSelectedBg: isDark ? '#1E3A8A' : '#EFF6FF',
    }
  }
});
