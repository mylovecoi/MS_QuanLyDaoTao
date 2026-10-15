using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Services;

public class ProfileService : IProfileService
{
    private readonly IdentityDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;

    public ProfileService(IdentityDbContext context, IPasswordHasher<AppUser> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserProfileDto?> GetProfileByUserIdAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.PermissionGroup)
            .Include(u => u.StaffProfile)
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return MapToDto(user);
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.PermissionGroup)
            .Include(u => u.StaffProfile)
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        user.FullName = dto.FullName.Trim();
        user.Email = dto.Email?.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.DateOfBirth = dto.DateOfBirth;
        user.Gender = dto.Gender?.Trim();
        user.Address = dto.Address?.Trim();
        user.CitizenId = dto.CitizenId?.Trim();
        user.IssueDate = dto.IssueDate;
        user.IssuePlace = dto.IssuePlace?.Trim();
        user.BankAccount = dto.BankAccount?.Trim();
        user.BankName = dto.BankName?.Trim();
        user.SocialInsuranceNumber = dto.SocialInsuranceNumber?.Trim();
        user.HealthInsuranceNumber = dto.HealthInsuranceNumber?.Trim();
        user.AcademicRank = dto.AcademicRank?.Trim();
        user.ProfessionalLevel = dto.ProfessionalLevel?.Trim();
        user.ForeignLanguageLevel = dto.ForeignLanguageLevel?.Trim();
        user.Position = dto.Position?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<(bool Success, string Message)> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, "Không tìm thấy thông tin tài khoản.");

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            return (false, "Mật khẩu hiện tại không chính xác.");
        }

        if (dto.NewPassword != dto.ConfirmPassword)
        {
            return (false, "Mật khẩu xác nhận không khớp.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (true, "Đổi mật khẩu thành công.");
    }

    public async Task<bool> UpdateAvatarAsync(Guid userId, string avatarUrl)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Avatar = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static UserProfileDto MapToDto(AppUser user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            UserType = user.UserType,
            IsSuperAdmin = user.IsSuperAdmin,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            Avatar = user.Avatar,
            Address = user.Address,
            CitizenId = user.CitizenId,
            IssueDate = user.IssueDate,
            IssuePlace = user.IssuePlace,
            BankAccount = user.BankAccount,
            BankName = user.BankName,
            SocialInsuranceNumber = user.SocialInsuranceNumber,
            HealthInsuranceNumber = user.HealthInsuranceNumber,
            AcademicRank = user.AcademicRank,
            ProfessionalLevel = user.ProfessionalLevel,
            ForeignLanguageLevel = user.ForeignLanguageLevel,
            Position = user.Position,
            PermissionGroupId = user.PermissionGroupId,
            PermissionGroupName = user.PermissionGroup?.Name,
            StaffInfo = user.StaffProfile == null ? null : new StaffProfileDto
            {
                Id = user.StaffProfile.Id,
                StaffCode = user.StaffProfile.StaffCode,
                StaffType = user.StaffProfile.StaffType,
                DepartmentId = user.StaffProfile.DepartmentId,
                SignTitle = user.StaffProfile.SignTitle,
                SignFullName = user.StaffProfile.SignFullName
            },
            StudentInfo = user.StudentProfile == null ? null : new StudentProfileDto
            {
                Id = user.StudentProfile.Id,
                StudentCode = user.StudentProfile.StudentCode,
                ClassId = user.StudentProfile.ClassId,
                ClassPositionId = user.StudentProfile.ClassPositionId,
                Workplace = user.StudentProfile.Workplace,
                TrainingResult = user.StudentProfile.TrainingResult
            }
        };
    }
}
