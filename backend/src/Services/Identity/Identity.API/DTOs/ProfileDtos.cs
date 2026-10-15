using Shared.Common.Enums;

namespace Identity.API.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public string RoleName => Role.ToString().ToUpper();
    public UserType UserType { get; set; }
    public bool IsSuperAdmin { get; set; }

    // Thông tin cá nhân
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Avatar { get; set; }
    public string? Address { get; set; }

    // Giấy tờ
    public string? CitizenId { get; set; }
    public DateTime? IssueDate { get; set; }
    public string? IssuePlace { get; set; }

    // Ngân hàng & BH
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public string? HealthInsuranceNumber { get; set; }

    // Học hàm, học vị, chức vụ
    public string? AcademicRank { get; set; }
    public string? ProfessionalLevel { get; set; }
    public string? ForeignLanguageLevel { get; set; }
    public string? Position { get; set; }

    // Nhóm quyền
    public Guid? PermissionGroupId { get; set; }
    public string? PermissionGroupName { get; set; }

    // Thông tin chuyên biệt nếu là Cán bộ
    public StaffProfileDto? StaffInfo { get; set; }

    // Thông tin chuyên biệt nếu là Học viên
    public StudentProfileDto? StudentInfo { get; set; }
}

public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? CitizenId { get; set; }
    public DateTime? IssueDate { get; set; }
    public string? IssuePlace { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public string? HealthInsuranceNumber { get; set; }
    public string? AcademicRank { get; set; }
    public string? ProfessionalLevel { get; set; }
    public string? ForeignLanguageLevel { get; set; }
    public string? Position { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class UpdateAvatarDto
{
    public string AvatarUrl { get; set; } = string.Empty;
}
