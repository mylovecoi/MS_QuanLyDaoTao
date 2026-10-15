using Shared.Common.Enums;
using Shared.Common.Pagination;

namespace Identity.API.DTOs;

public class StaffProfileDto
{
    public Guid Id { get; set; }
    public string StaffCode { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public string StaffTypeName => StaffType switch
    {
        StaffType.Teacher => "Giảng viên / Giáo viên",
        StaffType.Manager => "Cán bộ Quản lý",
        StaffType.Leader => "Cán bộ Lãnh đạo",
        StaffType.Principal => "Hiệu trưởng / Ban Giám hiệu",
        _ => "Cán bộ"
    };
    public Guid? DepartmentId { get; set; }
    public string? SignTitle { get; set; }
    public string? SignFullName { get; set; }
}

public class StaffItemDto
{
    public Guid Id { get; set; } // UserId
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Avatar { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Thông tin Cán bộ
    public string StaffCode { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public string StaffTypeName => StaffType switch
    {
        StaffType.Teacher => "Giảng viên / Giáo viên",
        StaffType.Manager => "Cán bộ Quản lý",
        StaffType.Leader => "Cán bộ Lãnh đạo",
        StaffType.Principal => "Hiệu trưởng / Ban Giám hiệu",
        _ => "Cán bộ"
    };
    public Guid? DepartmentId { get; set; }
    public string? SignTitle { get; set; }
    public string? SignFullName { get; set; }

    // Nhóm quyền
    public Guid? PermissionGroupId { get; set; }
    public string? PermissionGroupName { get; set; }

    public string? AcademicRank { get; set; }
    public string? Position { get; set; }

    // Thông tin định danh & hồ sơ cá nhân
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public DateTime? IssueDate { get; set; }
    public string? IssuePlace { get; set; }
    public string? Address { get; set; }

    // Tài khoản ngân hàng & Bảo hiểm
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public string? HealthInsuranceNumber { get; set; }
}

public class CreateStaffDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    // Thông tin cán bộ
    public string StaffCode { get; set; } = string.Empty;
    public StaffType StaffType { get; set; } = StaffType.Teacher;
    public Guid? DepartmentId { get; set; }
    public string? SignTitle { get; set; }
    public string? SignFullName { get; set; }

    // Hồ sơ bổ sung
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public DateTime? IssueDate { get; set; }
    public string? IssuePlace { get; set; }
    public string? Address { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public string? HealthInsuranceNumber { get; set; }
    public string? AcademicRank { get; set; }
    public string? Position { get; set; }
    public Guid? PermissionGroupId { get; set; }
}

public class UpdateStaffDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;

    // Thông tin cán bộ
    public string StaffCode { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? SignTitle { get; set; }
    public string? SignFullName { get; set; }

    // Hồ sơ bổ sung
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public DateTime? IssueDate { get; set; }
    public string? IssuePlace { get; set; }
    public string? Address { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? SocialInsuranceNumber { get; set; }
    public string? HealthInsuranceNumber { get; set; }
    public string? AcademicRank { get; set; }
    public string? Position { get; set; }
    public Guid? PermissionGroupId { get; set; }
}

public class StaffFilterDto : PaginationFilter
{
    public StaffType? StaffType { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool? IsActive { get; set; }
}
