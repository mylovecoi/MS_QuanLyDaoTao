# 🎓 HỆ THỐNG QUẢN LÝ ĐÀO TẠO (MICROSERVICES ARCHITECTURE)

Hệ thống quản lý đào tạo đại học toàn diện xây dựng theo kiến trúc **Microservices** phân tán hiện đại, sử dụng **.NET 10 (C#)** ở tầng Back-end, **YARP API Gateway** làm cổng điều phối tập trung, và **React + Ant Design 5** ở tầng Front-end.

---

## 🏛️ 1. Bản Đồ Dịch Vụ & Trách Nhiệm Phân Hệ (Service Architecture Matrix)

| Phân hệ / Dịch vụ | Nền tảng | Cổng nội bộ | Endpoint Gateway (`:7000`) | Trạng thái | Trách nhiệm chính & Cách sử dụng |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **API Gateway** | YARP (.NET 10) | `7000` | `http://localhost:7000` | 🟢 Hoàn tất | Điểm đón duy nhất của toàn hệ thống; định tuyến Reverse Proxy; xử lý CORS và điều phối luồng request. |
| **Identity.API** | ASP.NET Core | `5001` | `/api/auth/**` | 🟢 Hoàn tất | Quản lý định danh; cấp JWT Token & Refresh Token Rotation; Quản lý hồ sơ Cán bộ (Staff 360°), Học viên (Student); Phân quyền động (Permission Groups). |
| **Catalog.API** | ASP.NET Core | `5002` | `/api/catalog/**` | 🟢 Hoàn tất | Danh mục dùng chung (Master Data): Phòng học (`/rooms`), Môn học (`/subjects`), Khóa học (`/courses`), Tiêu chí đánh giá. |
| **Storage.API** | ASP.NET Core | `5006` | `/api/storage/**`<br>Static: `/uploads/**` | 🟢 Hoàn tất | Lưu trữ tệp tin đa phương tiện; upload Avatar (giới hạn 2MB, chống ghi đè); phục vụ Static Files qua Gateway. |
| **Academic.API** | ASP.NET Core | `5003` | `/api/academic/**` | 🟡 Kế hoạch | Quản lý Lớp học (`/classes`), Khung chương trình đào tạo (`/curriculums`), Kế hoạch giảng dạy, Quản lý văn bằng. |
| **Grading.API** | ASP.NET Core | `5004` | `/api/grading/**` | 🟡 Kế hoạch | Điểm danh (`/attendances`), Bảng điểm (`/grades`), Ngân hàng câu hỏi, Quản lý đề thi (`/exam-papers`), Xử lý vi phạm. |
| **Notification.API** | ASP.NET Core | `5005` | `/api/notifications/**` | 🟡 Kế hoạch | Thông báo toàn trường, Tài liệu học tập, Quản lý đề tài Nghiên cứu khoa học (NCKH). |
| **Admin Portal** | React + Vite | `5173` | `http://localhost:5173` | 🟢 Hoàn tất | Giao diện Quản trị chuẩn mực Ant Design 5 (Bố cục 3-Card, Drawer 360°, Phân quyền động, Dark/Light theme). |

---

## 💡 2. Mô Tả Chi Tiết Các Microservices Đã Hoàn Thiện

### 🔑 1. Identity Service (`Identity.API` - Port: `5001`)
- **Mục đích:** Đóng vai trò là "trái tim" bảo mật và quản lý nhân sự của toàn hệ thống đào tạo.
- **Chức năng chính:**
  - **Xác thực:** Đăng nhập `/api/auth/login`, Tự động làm mới phiên `/api/auth/refresh-token` (không bị văng khi đóng trình duyệt).
  - **Quản lý Tài khoản (`UsersController`):** Xem danh sách, tạo mới, khóa/mở khóa tài khoản, cấp lại mật khẩu.
  - **Hồ sơ 360° (`StaffManagement` & `StudentManagement`):** Đồng bộ thông tin định danh (Mã CB, Mã HV, Phòng ban, Học hàm/Học vị, Tài khoản ngân hàng chi trả lương/học phí).
  - **Phân quyền Động (`PermissionGroupsController`):** Thiết lập ma trận quyền chi tiết (Xem, Thêm, Sửa, Xóa) cho từng Ban / Phòng / Khoa.
  - **An ninh IAM:** Khóa chặt 3 tầng chống leo thang đặc quyền (Privilege Escalation), ngăn chặn tuyệt đối việc Staff tự cấp quyền Admin.

### 📚 2. Catalog Service (`Catalog.API` - Port: `5002`)
- **Mục đích:** Quản lý cơ sở vật chất và dữ liệu danh mục nền tảng phục vụ xếp lịch đào tạo.
- **Chức năng chính:**
  - **Quản lý Phòng học (`RoomsController`):** Mã phòng, Sức chứa, Loại phòng (Lý thuyết, Thực hành máy tính, Hội trường), Tòa nhà, Trạng thái sử dụng.
  - Hỗ trợ tìm kiếm, lọc nhanh theo loại phòng và phân trang hiệu năng cao với Entity Framework Core.

### 📦 3. Storage Service (`Storage.API` - Port: `5006`)
- **Mục đích:** Xử lý tập trung việc lưu trữ, kiểm duyệt và phục vụ tài nguyên tệp tin (Media Storage).
- **Chức năng chính:**
  - **Upload An Toàn (`/api/storage/upload`):** Tự động phân loại thư mục (`avatars`, `documents`, `exam-papers`), kiểm tra kích thước (tối đa 2MB cho ảnh), đổi tên file ngẫu nhiên chống tấn công ghi đè.
  - **Phục vụ Static Content:** Định tuyến qua API Gateway tại URL `/uploads/{folder}/{filename}`.

---

## 🚀 3. Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án

### Yêu cầu phần mềm
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/) & npm
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) (LocalDB hoặc SQL Server Instance)
- Visual Studio 2022 / 2025 hoặc Visual Studio Code / Rider

---

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu & Nạp Dữ Liệu Mẫu (Seed Data)
Đứng tại thư mục gốc của dự án, mở Terminal và chạy lệnh:
```powershell
cd backend
dotnet run --project src/Tools/DbInitializer/DbInitializer.csproj
```
> 🎉 **Kết quả:** Hệ thống sẽ tự động tạo các database `QLDaoTao_IdentityDb`, `QLDaoTao_CatalogDb` và nạp sẵn tài khoản Quản trị viên, Cán bộ, Sinh viên cùng dữ liệu danh mục phòng học mẫu.

---

### Bước 2: Khởi Chạy Back-end Microservices
Bạn có thể mở file solution `backend/QLDaoTao.slnx` bằng **Visual Studio** và chọn **Configure Startup Projects** để chạy đồng thời các service:
1. `ApiGateway` (Port 7000 - Cổng bắt buộc)
2. `Identity.API` (Port 5001)
3. `Catalog.API` (Port 5002)
4. `Storage.API` (Port 5006)

*(Hoặc chạy thủ công qua Terminal nếu không dùng Visual Studio):*
```powershell
# Terminal 1: API Gateway
dotnet run --project backend/src/Gateways/ApiGateway/ApiGateway.csproj

# Terminal 2: Identity Service
dotnet run --project backend/src/Services/Identity/Identity.API/Identity.API.csproj

# Terminal 3: Catalog Service
dotnet run --project backend/src/Services/Catalog/Catalog.API/Catalog.API.csproj

# Terminal 4: Storage Service
dotnet run --project backend/src/Services/Storage/Storage.API/Storage.API.csproj
```

---

### Bước 3: Khởi Chạy Front-end (Admin Portal)
Mở một cửa sổ Terminal mới:
```powershell
cd frontend
npm run dev
```
Mở trình duyệt truy cập:  
👉 **`http://localhost:5173`**

---

## 👥 4. Tài Khoản Đăng Nhập Thử Nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu mặc định | Thẩm quyền chính |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin` | `AdminPassword@123` | Toàn quyền hệ thống, phân quyền nhóm, quản trị tài khoản & cán bộ |
| **Cán Bộ Đào Tạo (Staff)** | `canbo01` | `CanBoPassword@123` | Quản lý danh mục đào tạo, phòng học, hồ sơ học vụ |
| **Học Viên (Student)** | `sinhvien01` | `HocVienPassword@123` | Tra cứu hồ sơ học viên, xem chương trình học |

---

## 🛡️ 5. Chuẩn Mã Lỗi Hệ Thống (Centralized Error Codes)
Hệ thống sử dụng bảng mã lỗi máy đọc (Machine-Readable Error Codes) tập trung tại `Shared.Common.Constants.ErrorCodes` đồng bộ với `src/constants/errorCodes.ts` ở Frontend:
- `AUTH_USERNAME_ALREADY_EXISTS`: Tên đăng nhập đã tồn tại.
- `AUTH_FORBIDDEN_ROLE_ADMIN`: Chặn hành vi cố tình leo thang đặc quyền Admin.
- `SYS_INTERNAL_ERROR`: Bọc lỗi ngoại lệ an toàn qua `GlobalExceptionMiddleware`.

---

## 📁 6. Cấu Trúc Mã Nguồn

```text
QLDaoTao_Microservices/
├── backend/
│   ├── src/
│   │   ├── Gateways/ApiGateway/       # YARP Reverse Proxy Gateway (Port 7000)
│   │   ├── Services/
│   │   │   ├── Identity/Identity.API/ # Quản lý Tài khoản, Phân quyền, Nhân sự (Port 5001)
│   │   │   ├── Catalog/Catalog.API/   # Quản lý Danh mục dùng chung (Port 5002)
│   │   │   └── Storage/Storage.API/   # Dịch vụ Lưu trữ & Upload Tệp tin (Port 5006)
│   │   ├── Shared/
│   │   │   ├── Shared.Common/         # ApiResponse, ErrorCodes, BaseEntity, Middleware
│   │   │   └── Shared.Security/       # JWT Token Authentication Handler, Constants
│   │   └── Tools/DbInitializer/       # Tool Migration & Nạp dữ liệu mẫu
│   └── QLDaoTao.slnx
├── frontend/
│   ├── package.json                  # Runner script
│   └── admin-portal/                 # Ứng dụng React + Ant Design 5 (Vite)
│       └── src/
│           ├── api/                  # Axios Client + Auto-refresh Token Interceptor
│           ├── constants/            # ErrorCodes, Banks, Roles
│           ├── contexts/             # AuthContext, ThemeContext
│           ├── layouts/              # AppLayout (Sidebar thông minh, Header)
│           ├── pages/                # Các trang nghiệp vụ (Users, Staff, Student, Rooms...)
│           └── utils/                # Single Source of Truth (url.ts, formatter.ts)
└── README.md
```
