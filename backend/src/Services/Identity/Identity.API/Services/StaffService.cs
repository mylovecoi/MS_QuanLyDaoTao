using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Enums;
using Shared.Common.Pagination;

namespace Identity.API.Services;

public class StaffService : IStaffService
{
    private readonly IdentityDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;

    public StaffService(IdentityDbContext context, IPasswordHasher<AppUser> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<StaffItemDto>> GetPagedAsync(StaffFilterDto filter)
    {
        var query = _context.Users
            .Include(u => u.PermissionGroup)
            .Include(u => u.StaffProfile)
            .Where(u => u.UserType == UserType.Staff && u.StaffProfile != null)
            .AsNoTracking()
            .AsQueryable();

        var searchTerm = filter.SearchTerm ?? filter.Keyword;
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(term)
                                  || u.FullName.ToLower().Contains(term)
                                  || (u.StaffProfile != null && u.StaffProfile.StaffCode.ToLower().Contains(term))
                                  || (u.Email != null && u.Email.ToLower().Contains(term)));
        }

        if (filter.StaffType.HasValue)
        {
            query = query.Where(u => u.StaffProfile != null && u.StaffProfile.StaffType == filter.StaffType.Value);
        }

        if (filter.DepartmentId.HasValue)
        {
            query = query.Where(u => u.StaffProfile != null && u.StaffProfile.DepartmentId == filter.DepartmentId.Value);
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        var totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => new StaffItemDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Avatar = u.Avatar,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                StaffCode = u.StaffProfile != null ? u.StaffProfile.StaffCode : string.Empty,
                StaffType = u.StaffProfile != null ? u.StaffProfile.StaffType : StaffType.Teacher,
                DepartmentId = u.StaffProfile != null ? u.StaffProfile.DepartmentId : null,
                SignTitle = u.StaffProfile != null ? u.StaffProfile.SignTitle : null,
                SignFullName = u.StaffProfile != null ? u.StaffProfile.SignFullName : null,
                PermissionGroupId = u.PermissionGroupId,
                PermissionGroupName = u.PermissionGroup != null ? u.PermissionGroup.Name : null,
                AcademicRank = u.AcademicRank,
                Position = u.Position,
                DateOfBirth = u.DateOfBirth,
                Gender = u.Gender,
                CitizenId = u.CitizenId,
                IssueDate = u.IssueDate,
                IssuePlace = u.IssuePlace,
                Address = u.Address,
                BankAccount = u.BankAccount,
                BankName = u.BankName,
                SocialInsuranceNumber = u.SocialInsuranceNumber,
                HealthInsuranceNumber = u.HealthInsuranceNumber
            })
            .ToListAsync();

        return new PagedResult<StaffItemDto>(items, totalRecords, filter.PageNumber, filter.PageSize);
    }

    public async Task<StaffItemDto?> GetByIdAsync(Guid userId)
    {
        var u = await _context.Users
            .Include(x => x.PermissionGroup)
            .Include(x => x.StaffProfile)
            .FirstOrDefaultAsync(x => x.Id == userId && x.UserType == UserType.Staff);

        if (u == null || u.StaffProfile == null) return null;

        return new StaffItemDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Avatar = u.Avatar,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            StaffCode = u.StaffProfile.StaffCode,
            StaffType = u.StaffProfile.StaffType,
            DepartmentId = u.StaffProfile.DepartmentId,
            SignTitle = u.StaffProfile.SignTitle,
            SignFullName = u.StaffProfile.SignFullName,
            PermissionGroupId = u.PermissionGroupId,
            PermissionGroupName = u.PermissionGroup?.Name,
            AcademicRank = u.AcademicRank,
            Position = u.Position,
            DateOfBirth = u.DateOfBirth,
            Gender = u.Gender,
            CitizenId = u.CitizenId,
            IssueDate = u.IssueDate,
            IssuePlace = u.IssuePlace,
            Address = u.Address,
            BankAccount = u.BankAccount,
            BankName = u.BankName,
            SocialInsuranceNumber = u.SocialInsuranceNumber,
            HealthInsuranceNumber = u.HealthInsuranceNumber
        };
    }

    public async Task<(bool Success, string Message, StaffItemDto? Data)> CreateAsync(CreateStaffDto dto, string createdBy)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username.Trim()))
        {
            return (false, "Tên đăng nhập đã tồn tại trong hệ thống.", null);
        }

        if (await _context.StaffProfiles.AnyAsync(s => s.StaffCode == dto.StaffCode.Trim()))
        {
            return (false, "Mã số cán bộ đã tồn tại.", null);
        }

        var user = new AppUser
        {
            Username = dto.Username.Trim(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email?.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            Role = UserRole.CanBo,
            UserType = UserType.Staff,
            IsActive = true,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender?.Trim(),
            CitizenId = dto.CitizenId?.Trim(),
            IssueDate = dto.IssueDate,
            IssuePlace = dto.IssuePlace?.Trim(),
            Address = dto.Address?.Trim(),
            BankAccount = dto.BankAccount?.Trim(),
            BankName = dto.BankName?.Trim(),
            SocialInsuranceNumber = dto.SocialInsuranceNumber?.Trim(),
            HealthInsuranceNumber = dto.HealthInsuranceNumber?.Trim(),
            AcademicRank = dto.AcademicRank?.Trim(),
            Position = dto.Position?.Trim(),
            PermissionGroupId = dto.PermissionGroupId,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        var staffProfile = new StaffProfile
        {
            UserId = user.Id,
            StaffCode = dto.StaffCode.Trim(),
            StaffType = dto.StaffType,
            DepartmentId = dto.DepartmentId,
            SignTitle = dto.SignTitle?.Trim(),
            SignFullName = dto.SignFullName?.Trim(),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        user.StaffProfile = staffProfile;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, "Thêm mới cán bộ thành công.", await GetByIdAsync(user.Id));
    }

    public async Task<(bool Success, string Message, StaffItemDto? Data)> UpdateAsync(Guid userId, UpdateStaffDto dto, string updatedBy)
    {
        var user = await _context.Users
            .Include(u => u.StaffProfile)
            .FirstOrDefaultAsync(u => u.Id == userId && u.UserType == UserType.Staff);

        if (user == null || user.StaffProfile == null)
        {
            return (false, "Không tìm thấy thông tin cán bộ.", null);
        }

        if (await _context.StaffProfiles.AnyAsync(s => s.StaffCode == dto.StaffCode.Trim() && s.UserId != userId))
        {
            return (false, "Mã số cán bộ đã trùng với cán bộ khác.", null);
        }

        user.FullName = dto.FullName.Trim();
        user.Email = dto.Email?.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.IsActive = dto.IsActive;
        user.DateOfBirth = dto.DateOfBirth;
        user.Gender = dto.Gender?.Trim();
        user.CitizenId = dto.CitizenId?.Trim();
        user.IssueDate = dto.IssueDate;
        user.IssuePlace = dto.IssuePlace?.Trim();
        user.Address = dto.Address?.Trim();
        user.BankAccount = dto.BankAccount?.Trim();
        user.BankName = dto.BankName?.Trim();
        user.SocialInsuranceNumber = dto.SocialInsuranceNumber?.Trim();
        user.HealthInsuranceNumber = dto.HealthInsuranceNumber?.Trim();
        user.AcademicRank = dto.AcademicRank?.Trim();
        user.Position = dto.Position?.Trim();
        user.PermissionGroupId = dto.PermissionGroupId;
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = updatedBy;

        user.StaffProfile.StaffCode = dto.StaffCode.Trim();
        user.StaffProfile.StaffType = dto.StaffType;
        user.StaffProfile.DepartmentId = dto.DepartmentId;
        user.StaffProfile.SignTitle = dto.SignTitle?.Trim();
        user.StaffProfile.SignFullName = dto.SignFullName?.Trim();
        user.StaffProfile.UpdatedAt = DateTime.UtcNow;
        user.StaffProfile.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();
        return (true, "Cập nhật cán bộ thành công.", await GetByIdAsync(userId));
    }

    public async Task<bool> DeleteAsync(Guid userId, string deletedBy)
    {
        var user = await _context.Users
            .Include(u => u.StaffProfile)
            .FirstOrDefaultAsync(u => u.Id == userId && u.UserType == UserType.Staff);

        if (user == null) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.DeletedBy = deletedBy;

        if (user.StaffProfile != null)
        {
            user.StaffProfile.IsDeleted = true;
            user.StaffProfile.DeletedAt = DateTime.UtcNow;
            user.StaffProfile.DeletedBy = deletedBy;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
