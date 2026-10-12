using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Shared.Common.Enums;

namespace DbInitializer.Seeds;

/// <summary>
/// Dữ liệu tài khoản mẫu CHỈ DÙNG cho môi trường Phát triển cục bộ (Local Development / Testing).
/// CẢNH BÁO: Tuyệt đối không chạy file này trên môi trường Production!
/// </summary>
public static class UserSeedData
{
    public static List<AppUser> GetUsers(IPasswordHasher<AppUser> passwordHasher, string? defaultPassword = null)
    {
        // Ưu tiên đọc mật khẩu từ biến môi trường (nếu có cấu hình trong CI/CD)
        var password = defaultPassword 
            ?? Environment.GetEnvironmentVariable("SEED_DEFAULT_PASSWORD") 
            ?? "DevAdmin@123";

        var users = new List<AppUser>();

        // 1. Quản Trị Viên (Admin)
        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            FullName = "Quản Trị Viên Hệ Thống",
            Email = "admin@qldaotao.edu.vn",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, password);
        users.Add(admin);

        // 2. Cán bộ Đào tạo / Giảng viên
        var canbo = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = "canbo01",
            FullName = "ThS. Nguyễn Văn Giảng",
            Email = "giangnv@qldaotao.edu.vn",
            Role = UserRole.CanBo,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        canbo.PasswordHash = passwordHasher.HashPassword(canbo, password);
        users.Add(canbo);

        // 3. Học viên / Sinh viên
        var sinhvien = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = "sinhvien01",
            FullName = "Trần Thị Lan (K19 CNTT)",
            Email = "lantt_k19@qldaotao.edu.vn",
            Role = UserRole.HocVien,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        sinhvien.PasswordHash = passwordHasher.HashPassword(sinhvien, password);
        users.Add(sinhvien);

        return users;
    }
}
