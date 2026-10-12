using Catalog.API.Data;
using DbInitializer.Seeds;
using Identity.API.Data;
using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

    var passwordHasher = new PasswordHasher<AppUser>();
    var seedUsers = UserSeedData.GetUsers(passwordHasher);
    int addedCount = 0;

    foreach (var user in seedUsers)
    {
        if (!await identityContext.Users.AnyAsync(u => u.Username == user.Username))
        {
            identityContext.Users.Add(user);
            addedCount++;
        }
    }

    if (addedCount > 0)
    {
        await identityContext.SaveChangesAsync();
        Console.WriteLine($"  ✓ Đã nạp thành công {addedCount} tài khoản mẫu (admin, canbo01, sinhvien01).");
    }
    else
    {
        Console.WriteLine("  ✓ Dữ liệu tài khoản mẫu đã tồn tại từ trước (bỏ qua).");
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
