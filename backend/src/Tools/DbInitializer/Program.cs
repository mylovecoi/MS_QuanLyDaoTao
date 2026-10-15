using Catalog.API.Data;
using DbInitializer.Seeds;
using Identity.API.Data;
using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Enums;

Console.OutputEncoding = System.Text.Encoding.UTF8;
Console.WriteLine("==================================================");
Console.WriteLine("   QLDAOTAO - CÔNG CỤ KHỞI TẠO VÀ SEED DATABASE   ");
Console.WriteLine("==================================================\n");

var identityConn = "Server=.\\SQLEXPRESS;Database=QLDaoTao_IdentityDb;Trusted_Connection=True;TrustServerCertificate=True;";
var catalogConn = "Server=.\\SQLEXPRESS;Database=QLDaoTao_CatalogDb;Trusted_Connection=True;TrustServerCertificate=True;";

// 1. Khởi tạo & Seed IdentityDb
Console.WriteLine("[1/2] Đang kết nối và khởi tạo IdentityDb...");
var identityOptions = new DbContextOptionsBuilder<IdentityDbContext>()
    .UseSqlServer(identityConn)
    .Options;

using (var identityContext = new IdentityDbContext(identityOptions))
{
    await identityContext.Database.MigrateAsync();
    Console.WriteLine("  ✓ Migration IdentityDb thành công.");

    // 1.1 Seed Users
    var passwordHasher = new PasswordHasher<AppUser>();
    var seedUsers = UserSeedData.GetUsers(passwordHasher);
    int addedCount = 0;

    foreach (var user in seedUsers)
    {
        if (!await identityContext.Users.AnyAsync(u => u.Username == user.Username))
        {
            if (user.Username == "admin")
            {
                user.IsSuperAdmin = true;
                user.UserType = UserType.SystemAdmin;
            }
            else if (user.Role == UserRole.CanBo)
            {
                user.UserType = UserType.Staff;
            }
            else if (user.Role == UserRole.HocVien)
            {
                user.UserType = UserType.Student;
            }

            identityContext.Users.Add(user);
            addedCount++;
        }
    }

    if (addedCount > 0)
    {
        await identityContext.SaveChangesAsync();
        Console.WriteLine($"  ✓ Đã nạp thành công {addedCount} tài khoản mẫu.");
    }
    else
    {
        Console.WriteLine("  ✓ Dữ liệu tài khoản mẫu đã tồn tại từ trước (bỏ qua).");
    }

    // 1.2 Cập nhật IsSuperAdmin cho admin
    var adminUser = await identityContext.Users.FirstOrDefaultAsync(u => u.Username == "admin");
    if (adminUser != null && (!adminUser.IsSuperAdmin || adminUser.UserType != UserType.SystemAdmin))
    {
        adminUser.IsSuperAdmin = true;
        adminUser.UserType = UserType.SystemAdmin;
        await identityContext.SaveChangesAsync();
    }

    // 1.3 Seed StaffProfile cho canbo01 nếu chưa có
    var canboUser = await identityContext.Users.FirstOrDefaultAsync(u => u.Username == "canbo01");
    if (canboUser != null)
    {
        if (canboUser.UserType != UserType.Staff)
        {
            canboUser.UserType = UserType.Staff;
            await identityContext.SaveChangesAsync();
        }

        if (!await identityContext.StaffProfiles.AnyAsync(s => s.UserId == canboUser.Id))
        {
            identityContext.StaffProfiles.Add(new StaffProfile
            {
                Id = Guid.NewGuid(),
                UserId = canboUser.Id,
                StaffCode = "CB001",
                StaffType = StaffType.Teacher,
                SignTitle = "Giảng viên bộ môn",
                SignFullName = canboUser.FullName,
                CreatedBy = "DbInitializer",
                CreatedAt = DateTime.UtcNow
            });
            await identityContext.SaveChangesAsync();
            Console.WriteLine("  ✓ Đã nạp hồ sơ cán bộ mẫu cho canbo01 (Mã: CB001).");
        }
    }

    // 1.4 Seed StudentProfile cho sinhvien01 nếu chưa có
    var sinhvienUser = await identityContext.Users.FirstOrDefaultAsync(u => u.Username == "sinhvien01");
    if (sinhvienUser != null)
    {
        if (sinhvienUser.UserType != UserType.Student)
        {
            sinhvienUser.UserType = UserType.Student;
            await identityContext.SaveChangesAsync();
        }

        if (!await identityContext.StudentProfiles.AnyAsync(s => s.UserId == sinhvienUser.Id))
        {
            identityContext.StudentProfiles.Add(new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = sinhvienUser.Id,
                StudentCode = "HV001",
                Workplace = "Trung tâm Đào tạo & Bồi dưỡng",
                CreatedBy = "DbInitializer",
                CreatedAt = DateTime.UtcNow
            });
            await identityContext.SaveChangesAsync();
            Console.WriteLine("  ✓ Đã nạp hồ sơ học viên mẫu cho sinhvien01 (Mã: HV001).");
        }
    }

    // 1.5 Seed Cây Menu động (Menus)
    if (!await identityContext.Menus.AnyAsync())
    {
        var defaultMenus = MenuSeedData.GetDefaultMenus();
        identityContext.Menus.AddRange(defaultMenus);
        await identityContext.SaveChangesAsync();
        Console.WriteLine($"  ✓ Đã nạp thành công {defaultMenus.Count} mục cây Menu động có thứ tự SortOrder chuẩn.");
    }
    else
    {
        Console.WriteLine("  ✓ Cây Menu đã có dữ liệu (bỏ qua).");
    }

    // 1.6 Seed Nhóm quyền mẫu
    if (!await identityContext.PermissionGroups.AnyAsync())
    {
        var bghGroup = new PermissionGroup
        {
            Name = "Ban Giám Hiệu",
            Description = "Ban Lãnh đạo nhà trường, có quyền xem và phê duyệt toàn bộ hệ thống",
            CreatedBy = "DbInitializer"
        };
        var canBoGroup = new PermissionGroup
        {
            Name = "Cán Bộ Quản Lý & Giảng Viên",
            Description = "Quản lý lớp học, học viên, lịch học và phòng học",
            CreatedBy = "DbInitializer"
        };

        identityContext.PermissionGroups.AddRange(bghGroup, canBoGroup);
        await identityContext.SaveChangesAsync();
        Console.WriteLine("  ✓ Đã nạp 2 nhóm quyền mẫu (Ban Giám Hiệu, Cán Bộ Quản Lý).");
    }
}

Console.WriteLine();

// 2. Khởi tạo & Seed CatalogDb
Console.WriteLine("[2/2] Đang kết nối và khởi tạo CatalogDb...");
var catalogOptions = new DbContextOptionsBuilder<CatalogDbContext>()
    .UseSqlServer(catalogConn)
    .Options;

using (var catalogContext = new CatalogDbContext(catalogOptions))
{
    await catalogContext.Database.MigrateAsync();
    Console.WriteLine("  ✓ Migration CatalogDb thành công.");

    if (!await catalogContext.Rooms.AnyAsync())
    {
        var seedRooms = RoomSeedData.GetRooms();
        await catalogContext.Rooms.AddRangeAsync(seedRooms);
        await catalogContext.SaveChangesAsync();
        Console.WriteLine($"  ✓ Đã nạp thành công {seedRooms.Count} phòng học mẫu (P.101, P.102, P.201, Lab.01, HoiTruong.C).");
    }
    else
    {
        Console.WriteLine("  ✓ Dữ liệu phòng học đã tồn tại từ trước (bỏ qua).");
    }
}

Console.WriteLine("\n==================================================");
Console.WriteLine("  🎉 HOÀN TẤT KHỞI TẠO VÀ SEED DỮ LIỆU THÀNH CÔNG! ");
Console.WriteLine("==================================================");
