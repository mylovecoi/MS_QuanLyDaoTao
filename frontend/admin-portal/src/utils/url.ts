/**
 * Helper xử lý URL hình ảnh/file upload trong toàn bộ hệ thống
 * Tương thích 100% với môi trường Development, Windows Server (IIS), Docker và Domain thực tế (Reverse Proxy)
 */
export const getFullAvatarUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // Trong môi trường Production có Reverse Proxy (Nginx / IIS cùng Domain):
  // Nếu VITE_API_BASE_URL là chuỗi rỗng ("") -> dùng đường dẫn tương đối để tự nhận Domain hiện tại
  const baseUrl = rawBaseUrl !== undefined
    ? rawBaseUrl
    : (import.meta.env.DEV ? 'http://localhost:7000' : '');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};
