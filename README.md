# HỆ THỐNG QUẢN LÝ ĐÀO TẠO ĐẠI HỌC & KHẢO THÍ (MICROSERVICES)

Hệ thống quản lý đào tạo đại học xây dựng theo kiến trúc **Microservices** phân tán, sử dụng nền tảng **.NET 10 (C#)** ở tầng Back-end, **YARP API Gateway** làm cổng điều phối, và **React 19 + Ant Design 6.x** ở tầng Front-end.

---

## 🏛️ 1. Bản Đồ Dịch Vụ & Cổng Kết Nối (Ports & Routing)

| Phân hệ / Dịch vụ | Nền tảng | Cổng nội bộ | Endpoint qua Gateway | Trách nhiệm chính |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | YARP (.NET 10) | `7000` | `http://localhost:7000` | Điểm truy cập duy nhất, định tuyến reverse proxy, CORS |
| **Identity.API** | ASP.NET Core | `5001` | `/api/auth/**` | Xác thực JWT, Refresh Token Rotation, Quản lý tài khoản |
| **Catalog.API** | ASP.NET Core | `5002` | `/api/catalog/**` | Danh mục dùng chung (Phòng học, Môn học, Khóa học) |
| **Admin Portal** | React 19 + Vite | `3000` | `http://localhost:3000` | Giao diện quản trị Admin & Cán bộ đào tạo (Ant Design Pro) |

---

## 🔐 2. Cơ Chế Xác Thực JWT & Refresh Token (Token Rotation)

### Có bị đăng xuất khi tắt frontend hay trình duyệt không?
> **Trả lời: KHÔNG BỊ ĐĂNG XUẤT!**

1. **Cơ chế lưu trữ:** Cả `accessToken`, `refreshToken` và thông tin người dùng được lưu trữ an toàn trong `localStorage` của trình duyệt.
2. **Khi bạn tắt Web Server (`npm run dev`) hoặc tắt Trình duyệt rồi mở lại:**
   - Dữ liệu trong `localStorage` vẫn được duy trì nguyên vẹn.
   - Khi bạn truy cập lại trang web, `AuthContext` tự động khôi phục phiên đăng nhập từ `localStorage`.
   - **Tự động cấp mới Token:** Khi `accessToken` hết hạn, hệ thống Front-end tự động gửi `refreshToken` ngầm qua API `POST /api/auth/refresh-token` để lấy token mới (Token Rotation). Người dùng tiếp tục thao tác bình thường mà không cần đăng nhập lại.
3. **Khi nào bạn mới phải đăng nhập lại?**
   - Bạn chủ động bấm nút **"Đăng xuất"** (Hệ thống sẽ xóa token ở client và gọi API revoke token ở server).
   - `refreshToken` hết hạn hoàn toàn (mặc định sau 7 ngày).
   - Quản trị viên thực hiện thao tác **"Đặt lại mật khẩu"** hoặc **"Khóa tài khoản"** của bạn (server tự động vô hiệu hóa toàn bộ Refresh Token của tài khoản đó).

---

## 🚀 3. Hướng Dẫn Khởi Chạy Dự Án

### Yêu cầu môi trường
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/) & npm
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) (LocalDB hoặc SQL Server Instance)

---

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu & Nạp Dữ Liệu Mẫu (Seed Data)
Đứng tại thư mục gốc dự án:
```powershell
cd backend
dotnet run --project src/Tools/DbInitializer/DbInitializer.csproj
```
> Lệnh này sẽ tự động tạo cơ sở dữ liệu `QLDaoTao_IdentityDb`, `QLDaoTao_CatalogDb` và tạo sẵn tài khoản Admin, Cán bộ, Sinh viên cùng danh sách phòng học mẫu.

---

### Bước 2: Khởi Chạy Tầng Back-end Microservices
Mở các cửa sổ Terminal riêng (hoặc chạy ngầm):

1. **Chạy Identity Service:**
   ```powershell
   cd backend
   dotnet run --project src/Services/Identity/Identity.API/Identity.API.csproj
   ```
   *(Lắng nghe tại: `http://localhost:5001` - Swagger: `http://localhost:5001/swagger`)*

2. **Chạy Catalog Service:**
   ```powershell
   cd backend
   dotnet run --project src/Services/Catalog/Catalog.API/Catalog.API.csproj
   ```
   *(Lắng nghe tại: `http://localhost:5002` - Swagger: `http://localhost:5002/swagger`)*

3. **Chạy API Gateway (Bắt buộc để kết nối Frontend):**
   ```powershell
   cd backend
   dotnet run --project src/Gateways/ApiGateway/ApiGateway.csproj
   ```
   *(Lắng nghe tại: `http://localhost:7000`)*

---

### Bước 3: Khởi Chạy Tầng Front-end (Web Portal)

Bạn có thể đứng ngay tại thư mục `frontend` để chạy mà không cần vào sâu bên trong:
```powershell
cd frontend
npm run dev
```
*(Hoặc chạy trực tiếp tại `frontend/admin-portal`):*
```powershell
cd frontend/admin-portal
npm run dev
```

Mở trình duyệt truy cập:
👉 **`http://localhost:3000`**

---

## 👥 4. Tài Khoản Thử Nghiệm Mẫu (Seed Credentials)

| Vai trò | Tên đăng nhập (`username`) | Mật khẩu (`password`) | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin` | `AdminPassword@123` | Quản trị tài khoản, cấu hình hệ thống, toàn quyền danh mục |
| **Cán Bộ Đào Tạo** | `canbo01` | `CanBoPassword@123` | Quản lý danh mục phòng học, môn học, học vụ |
| **Học Viên / Sinh Viên** | `sinhvien01` | `HocVienPassword@123` | Tra cứu thông tin, xem điểm, lịch học |

---

## 📁 5. Cấu Trúc Thư Mục Dự Án

```text
QLDaoTao_Microservices/
├── backend/
│   ├── src/
│   │   ├── Gateways/
│   │   │   └── ApiGateway/            # YARP Gateway (Port 7000)
│   │   ├── Services/
│   │   │   ├── Identity/Identity.API/  # Xác thực & Quản lý User (Port 5001)
│   │   │   └── Catalog/Catalog.API/    # Danh mục dùng chung (Port 5002)
│   │   ├── Shared/
│   │   │   ├── Shared.Common/          # Base Entity, DTO, Response, Middleware
│   │   │   └── Shared.Security/        # JWT Authentication Handler, Policy
│   │   └── Tools/
│   │       └── DbInitializer/          # Công cụ Migration & Seed dữ liệu
│   └── backend.sln
├── frontend/
│   ├── package.json                   # Script proxy gọi nhanh admin-portal
│   └── admin-portal/                  # Cổng Quản Trị React 19 + Ant Design 6.x
│       ├── src/
│       │   ├── api/                   # Axios client + Interceptors tự động refresh token
│       │   ├── components/            # ThemeToggle (☀️/🌙), ProtectedRoute
│       │   ├── contexts/              # AuthContext, ThemeContext
│       │   ├── layouts/               # AppLayout (Sidebar, Header, Breadcrumb)
│       │   ├── pages/                 # LoginPage (Ant Design Pro), RoomsPage, UserManagementPage
│       │   └── theme/                 # Ant Design Design Tokens (Dark / Light)
│       └── vite.config.ts             # Cấu hình cổng 3000
├── .gitignore                         # Loại bỏ bin, obj, node_modules, temp
└── README.md                          # Tài liệu hướng dẫn sử dụng
```
