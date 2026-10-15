using Identity.API.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Entities;

namespace Identity.API.Data;

public class IdentityDbContext : DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<StaffProfile> StaffProfiles => Set<StaffProfile>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<AppMenu> Menus => Set<AppMenu>();
    public DbSet<PermissionGroup> PermissionGroups => Set<PermissionGroup>();
    public DbSet<PermissionGroupDetail> PermissionGroupDetails => Set<PermissionGroupDetail>();
    public DbSet<PermissionGroupDetail> GroupPermissions => PermissionGroupDetails;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động cấu hình ValueGeneratedOnAdd() cho tất cả các Entity kế thừa BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(nameof(BaseEntity.Id))
                    .ValueGeneratedOnAdd();
            }
        }

        // 1. Cấu hình bảng Người dùng (AppUsers)
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("AppUsers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username)
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.CitizenId).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).HasConversion<int>();
            entity.Property(e => e.UserType).HasConversion<int>();

            // Khóa ngoại N-1 tới Nhóm Quyền (PermissionGroup)
            entity.HasOne(e => e.PermissionGroup)
                  .WithMany(g => g.Users)
                  .HasForeignKey(e => e.PermissionGroupId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Global Query Filter: Loại trừ bản ghi đã xóa mềm
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 2. Cấu hình bảng Hồ sơ Cán bộ (StaffProfiles) - Quan hệ 1:1 với AppUsers
        modelBuilder.Entity<StaffProfile>(entity =>
        {
            entity.ToTable("StaffProfiles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StaffCode)
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.StaffCode).HasMaxLength(50).IsRequired();
            entity.Property(e => e.StaffType).HasConversion<int>();
            entity.Property(e => e.SignTitle).HasMaxLength(150);
            entity.Property(e => e.SignFullName).HasMaxLength(150);

            entity.HasOne(s => s.User)
                  .WithOne(u => u.StaffProfile)
                  .HasForeignKey<StaffProfile>(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 3. Cấu hình bảng Hồ sơ Học viên (StudentProfiles) - Quan hệ 1:1 với AppUsers
        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.ToTable("StudentProfiles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StudentCode)
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.StudentCode).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Workplace).HasMaxLength(300);

            entity.HasOne(s => s.User)
                  .WithOne(u => u.StudentProfile)
                  .HasForeignKey<StudentProfile>(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 4. Cấu hình bảng Cây Menu động (Menus) - Tự tham chiếu Cha - Con
        modelBuilder.Entity<AppMenu>(entity =>
        {
            entity.ToTable("Menus");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code)
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.Code).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Path).HasMaxLength(250);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Type).HasConversion<int>();

            // Khóa ngoại tự tham chiếu ParentId
            entity.HasOne(m => m.Parent)
                  .WithMany(m => m.Children)
                  .HasForeignKey(m => m.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 5. Cấu hình bảng Nhóm Quyền (PermissionGroups)
        modelBuilder.Entity<PermissionGroup>(entity =>
        {
            entity.ToTable("PermissionGroups");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name)
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 6. Cấu hình bảng Chi tiết Ma trận Phân Quyền (PermissionGroupDetails)
        modelBuilder.Entity<PermissionGroupDetail>(entity =>
        {
            entity.ToTable("PermissionGroupDetails");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GroupId, e.MenuId })
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0");

            entity.HasOne(p => p.Group)
                  .WithMany(g => g.Permissions)
                  .HasForeignKey(p => p.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Menu)
                  .WithMany(m => m.Permissions)
                  .HasForeignKey(p => p.MenuId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // 7. Cấu hình bảng RefreshTokens
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.Property(e => e.Token).HasMaxLength(256).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });
    }
}
