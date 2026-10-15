using Shared.Common.Pagination;

namespace Identity.API.DTOs;

public class StudentProfileDto
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public Guid? ClassId { get; set; }
    public Guid? ClassPositionId { get; set; }
    public string? Workplace { get; set; }
    public string? TrainingResult { get; set; }
}

public class StudentItemDto
{
    public Guid Id { get; set; } // UserId
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Avatar { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Thông tin Học viên
    public string StudentCode { get; set; } = string.Empty;
    public Guid? ClassId { get; set; }
    public Guid? ClassPositionId { get; set; }
    public string? Workplace { get; set; }
    public string? TrainingResult { get; set; }

    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public string? Address { get; set; }
}

public class CreateStudentDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    // Thông tin học viên
    public string StudentCode { get; set; } = string.Empty;
    public Guid? ClassId { get; set; }
    public Guid? ClassPositionId { get; set; }
    public string? Workplace { get; set; }

    // Hồ sơ bổ sung
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public string? Address { get; set; }
}

public class UpdateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;

    // Thông tin học viên
    public string StudentCode { get; set; } = string.Empty;
    public Guid? ClassId { get; set; }
    public Guid? ClassPositionId { get; set; }
    public string? Workplace { get; set; }
    public string? TrainingResult { get; set; }

    // Hồ sơ bổ sung
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? CitizenId { get; set; }
    public string? Address { get; set; }
}

public class StudentFilterDto : PaginationFilter
{
    public Guid? ClassId { get; set; }
    public bool? IsActive { get; set; }
}
