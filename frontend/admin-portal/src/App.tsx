import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { getThemeConfig } from './theme/themeConfig';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RoomsPage } from './pages/catalog/RoomsPage';
import { UserManagementPage } from './pages/users/UserManagementPage';
import { StaffManagementPage } from './pages/users/StaffManagementPage';
import { StudentManagementPage } from './pages/users/StudentManagementPage';
import { MenuManagementPage } from './pages/system/MenuManagementPage';
import { PermissionGroupPage } from './pages/system/PermissionGroupPage';
import { AccountSettingsPage } from './pages/account/AccountSettingsPage';
import { ForbiddenPage, NotFoundPage } from './pages/errors/ErrorPages';

const MainApp: React.FC = () => {
  const { isDarkMode } = useTheme();
  const themeConfig = getThemeConfig(isDarkMode);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        ...themeConfig,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                
                {/* Catalog */}
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/subjects" element={<Navigate to="/rooms" replace />} />
                <Route path="/courses" element={<Navigate to="/rooms" replace />} />

                {/* User & Profiles */}
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/users/staff" element={<StaffManagementPage />} />
                <Route path="/users/students" element={<StudentManagementPage />} />
                <Route path="/account/settings" element={<AccountSettingsPage />} />

                {/* System & RBAC */}
                <Route path="/system/menus" element={<MenuManagementPage />} />
                <Route path="/system/permission-groups" element={<PermissionGroupPage />} />
              </Route>
            </Route>

            {/* Error pages */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
};

export default App;
