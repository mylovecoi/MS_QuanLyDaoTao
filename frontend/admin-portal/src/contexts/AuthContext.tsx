import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export interface UserInfo {
  userId: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'CANBO' | 'HOCVIEN' | string;
  roleId: number;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, userInfo: UserInfo) => void;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  updateUserAvatar: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Xác thực lại token với endpoint /api/auth/me
    apiClient
      .get('/api/auth/me')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const u = res.data.data;
          const updated: UserInfo = {
            userId: u.id,
            username: u.username,
            fullName: u.fullName,
            role: u.role,
            roleId: u.roleId,
            avatarUrl: u.avatar || u.avatarUrl,
          };
          setUser(updated);
          localStorage.setItem('user_info', JSON.stringify(updated));
        }
      })
      .catch(() => {
        // Token lỗi hoặc hết hạn và refresh thất bại
        localStorage.clear();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (accessToken: string, refreshToken: string, userInfo: UserInfo) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const updateUserAvatar = (avatarUrl: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, avatarUrl };
      localStorage.setItem('user_info', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // bỏ qua lỗi nếu có khi logout
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
