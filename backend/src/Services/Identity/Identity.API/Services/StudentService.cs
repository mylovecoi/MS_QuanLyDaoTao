using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Enums;
using Shared.Common.Pagination;

namespace Identity.API.Services;

public class StudentService : IStudentService
{
    private readonly IdentityDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;

    public StudentService(IdentityDbContext context, IPasswordHasher<AppUser> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<StudentItemDto>> GetPagedAsync(StudentFilterDto filter)
    {
        var query = _context.Users
            .Include(u => u.StudentProfile)
            .Where(u => u.UserType == UserType.Student && u.StudentProfile != null)
            .AsNoTracking()
            .AsQueryable();

        var searchTerm = filter.SearchTerm ?? filter.Keyword;
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(term)
                                  || u.FullName.ToLower().Contains(term)
                                  || (u.StudentProfile != null && u.StudentProfile.StudentCode.ToLower().Contains(term))
                                  || (u.Email != null && u.Email.ToLower().Contains(term)));
        }

        if (filter.ClassId.HasValue)
        {
            query = query.Where(u => u.StudentProfile != null && u.StudentProfile.ClassId == filter.ClassId.Value);
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
            .Select(u => new StudentItemDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Avatar = u.Avatar,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                StudentCode = u.StudentProfile != null ? u.StudentProfile.StudentCode : string.Empty,
                ClassId = u.StudentProfile != null ? u.StudentProfile.ClassId : null,
                ClassPositionId = u.StudentProfile != null ? u.StudentProfile.ClassPositionId : null,
                Workplace = u.StudentProfile != null ? u.StudentProfile.Workplace : null,
                TrainingResult = u.StudentProfile != null ? u.StudentProfile.TrainingResult : null,
                DateOfBirth = u.DateOfBirth,
                Gender = u.Gender,
                CitizenId = u.CitizenId,
                Address = u.Address
            })
            .ToListAsync();

        return new PagedResult<StudentItemDto>(items, totalRecords, filter.PageNumber, filter.PageSize);
    }

    public async Task<StudentItemDto?> GetByIdAsync(Guid userId)
    {
        var u = await _context.Users
            .Include(x => x.StudentProfile)
            .FirstOrDefaultAsync(x => x.Id == userId && x.UserType == UserType.Student);

        if (u == null || u.StudentProfile == null) return null;

        return new StudentItemDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Avatar = u.Avatar,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            StudentCode = u.StudentProfile.StudentCode,
            ClassId = u.StudentProfile.ClassId,
            ClassPositionId = u.StudentProfile.ClassPositionId,
            Workplace = u.StudentProfile.Workplace,
            TrainingResult = u.StudentProfile.TrainingResult,
            DateOfBirth = u.DateOfBirth,
            Gender = u.Gender,
            CitizenId = u.CitizenId,
            Address = u.Address
        };
    }

    public async Task<(bool Success, string Message, StudentItemDto? Data)> CreateAsync(CreateStudentDto dto, string createdBy)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username.Trim()))
        {
            return (false, "Tên đăng nhập đã tồn tại trong hệ thống.", null);
        }

        if (await _context.StudentProfiles.AnyAsync(s => s.StudentCode == dto.StudentCode.Trim()))
        {
            return (false, "Mã số học viên đã tồn tại.", null);
        }

        var user = new AppUser
        {
            Username = dto.Username.Trim(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email?.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            Role = UserRole.HocVien,
            UserType = UserType.Student,
            IsActive = true,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender?.Trim(),
            CitizenId = dto.CitizenId?.Trim(),
            Address = dto.Address?.Trim(),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        var studentProfile = new StudentProfile
        {
            UserId = user.Id,
            StudentCode = dto.StudentCode.Trim(),
            ClassId = dto.ClassId,
            ClassPositionId = dto.ClassPositionId,
            Workplace = dto.Workplace?.Trim(),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        user.StudentProfile = studentProfile;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, "Thêm mới học viên thành công.", await GetByIdAsync(user.Id));
    }

    public async Task<(bool Success, string Message, StudentItemDto? Data)> UpdateAsync(Guid userId, UpdateStudentDto dto, string updatedBy)
    {
        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId && u.UserType == UserType.Student);

        if (user == null || user.StudentProfile == null)
        {
            return (false, "Không tìm thấy thông tin học viên.", null);
        }

        if (await _context.StudentProfiles.AnyAsync(s => s.StudentCode == dto.StudentCode.Trim() && s.UserId != userId))
        {
            return (false, "Mã số học viên đã trùng với học viên khác.", null);
        }

        user.FullName = dto.FullName.Trim();
        user.Email = dto.Email?.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.IsActive = dto.IsActive;
        user.DateOfBirth = dto.DateOfBirth;
        user.Gender = dto.Gender?.Trim();
        user.CitizenId = dto.CitizenId?.Trim();
        user.Address = dto.Address?.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = updatedBy;

        user.StudentProfile.StudentCode = dto.StudentCode.Trim();
        user.StudentProfile.ClassId = dto.ClassId;
        user.StudentProfile.ClassPositionId = dto.ClassPositionId;
        user.StudentProfile.Workplace = dto.Workplace?.Trim();
        user.StudentProfile.TrainingResult = dto.TrainingResult?.Trim();
        user.StudentProfile.UpdatedAt = DateTime.UtcNow;
        user.StudentProfile.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();
        return (true, "Cập nhật học viên thành công.", await GetByIdAsync(userId));
    }

    public async Task<bool> DeleteAsync(Guid userId, string deletedBy)
    {
        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId && u.UserType == UserType.Student);

        if (user == null) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.DeletedBy = deletedBy;

        if (user.StudentProfile != null)
        {
            user.StudentProfile.IsDeleted = true;
            user.StudentProfile.DeletedAt = DateTime.UtcNow;
            user.StudentProfile.DeletedBy = deletedBy;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
