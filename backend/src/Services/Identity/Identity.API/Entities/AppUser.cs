using Shared.Common.Entities;
using Shared.Common.Enums;

namespace Identity.API.Entities;

public class AppUser : BaseEntity
{
    // Thông tin tài khoản
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.HocVien;
    public UserType UserType { get; set; } = UserType.Student;
    public bool IsActive { get; set; } = true;
    public bool IsSuperAdmin { get; set; } = false; // Tương đương cờ SSA ở dự án cũ

    // Thông tin cá nhân & Hồ sơ
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; } // Nam, Nữ, Khác
    public string? Avatar { get; set; }
    public string? Address { get; set; }

    // Giấy tờ tùy thân
    public string? CitizenId { get; set; } // CCCD / CMND
    public DateTime? IssueDate { get; set; } // Ngày cấp
    public string? IssuePlace { get; set; } // Nơi cấp

    // Tài khoản & Bảo hiểm
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; } // BHXH
    public string? HealthInsuranceNumber { get; set; } // BHYT

    // Trình độ & Chức vụ
    public string? AcademicRank { get; set; } // Học hàm / Học vị (Tiến sĩ, Thạc sĩ, PGS, GS...)
    public string? ProfessionalLevel { get; set; } // Trình độ chuyên môn
    public string? ForeignLanguageLevel { get; set; } // Ngoại ngữ
    public string? Position { get; set; } // Chức vụ

    // Nhóm quyền RBAC
    public Guid? PermissionGroupId { get; set; }
    public virtual PermissionGroup? PermissionGroup { get; set; }

    // Quan hệ 1:1 với Hồ sơ Cán bộ hoặc Hồ sơ Học viên
    public virtual StaffProfile? StaffProfile { get; set; }
    public virtual StudentProfile? StudentProfile { get; set; }

    // Refresh Tokens
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
