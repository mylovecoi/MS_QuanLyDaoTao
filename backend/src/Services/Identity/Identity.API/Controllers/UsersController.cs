using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Pagination;
using Shared.Common.Responses;
using Shared.Security.Constants;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/auth/[controller]")]
[Authorize(Roles = RoleConstants.Admin)]
public class UsersController : ControllerBase
{
    private readonly IdentityDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;

    public UsersController(
        IdentityDbContext context,
        IPasswordHasher<AppUser> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// Lấy danh sách tài khoản phân trang, hỗ trợ tìm kiếm và lọc theo Role/Trạng thái.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetPaged([FromQuery] UserFilterDto filter)
    {
        var query = _context.Users.AsNoTracking().Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(term) ||
                u.FullName.ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)));
        }

        if (filter.Role.HasValue)
        {
            query = query.Where(u => u.Role == filter.Role.Value);
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        var totalRecords = await query.CountAsync();

        var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
        var pageSize = filter.PageSize < 1 ? 10 : (filter.PageSize > 100 ? 100 : filter.PageSize);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString().ToUpperInvariant(),
                RoleId = (int)u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        var pagedResult = new PagedResult<UserDto>(users, totalRecords, pageNumber, pageSize);
        return Ok(ApiResponse<PagedResult<UserDto>>.SuccessResult(pagedResult, "Lấy danh sách tài khoản thành công."));
    }

    /// <summary>
    /// Lấy chi tiết tài khoản theo Id.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(Guid id)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.FailureResult("Không tìm thấy tài khoản trong hệ thống."));
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString().ToUpperInvariant(),
            RoleId = (int)user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Ok(ApiResponse<UserDto>.SuccessResult(userDto, "Lấy thông tin tài khoản thành công."));
    }

    /// <summary>
    /// Thêm mới tài khoản.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create([FromBody] CreateUserRequestDto request)
    {
        var trimmedUsername = request.Username.Trim();
        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == trimmedUsername.ToLower()))
        {
            return BadRequest(ApiResponse<UserDto>.FailureResult("Tên đăng nhập đã tồn tại trong hệ thống."));
        }

        var adminUsername = User.Identity?.Name ?? "ADMIN";

        var user = new AppUser
        {
            Username = trimmedUsername,
            FullName = request.FullName.Trim(),
            Email = request.Email?.Trim(),
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = adminUsername
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var resultDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString().ToUpperInvariant(),
            RoleId = (int)user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ApiResponse<UserDto>.SuccessResult(resultDto, "Tạo tài khoản thành công."));
    }

    /// <summary>
    /// Cập nhật thông tin tài khoản (Họ tên, Email, Vai trò).
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(Guid id, [FromBody] UpdateUserRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.FailureResult("Không tìm thấy tài khoản để cập nhật."));
        }

        var adminUsername = User.Identity?.Name ?? "ADMIN";

        user.FullName = request.FullName.Trim();
        user.Email = request.Email?.Trim();
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = adminUsername;

        await _context.SaveChangesAsync();

        var resultDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString().ToUpperInvariant(),
            RoleId = (int)user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Ok(ApiResponse<UserDto>.SuccessResult(resultDto, "Cập nhật thông tin tài khoản thành công."));
    }

    /// <summary>
    /// Kích hoạt hoặc khóa tài khoản.
    /// </summary>
    [HttpPatch("{id:guid}/toggle-status")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleStatus(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy tài khoản."));
        }

        // Không cho phép tự khóa tài khoản Admin chính đang đăng nhập
        if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase) && user.IsActive)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Không thể khóa tài khoản Quản trị viên mặc định hệ thống."));
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = User.Identity?.Name ?? "ADMIN";

        await _context.SaveChangesAsync();

        var statusText = user.IsActive ? "Kích hoạt" : "Khóa";
        return Ok(ApiResponse<bool>.SuccessResult(user.IsActive, $"{statusText} tài khoản thành công."));
    }

    /// <summary>
    /// Đặt lại mật khẩu cho tài khoản.
    /// </summary>
    [HttpPut("{id:guid}/reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword(Guid id, [FromBody] ResetPasswordRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy tài khoản để đặt lại mật khẩu."));
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = User.Identity?.Name ?? "ADMIN";

        // Đồng thời thu hồi tất cả Refresh Token đang kích hoạt của user này để bắt đăng nhập lại
        var activeTokens = await _context.RefreshTokens.Where(r => r.UserId == id && r.RevokedAt == null).ToListAsync();
        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResult(true, "Đặt lại mật khẩu thành công. Tất cả phiên đăng nhập cũ đã được thu hồi."));
    }
}
