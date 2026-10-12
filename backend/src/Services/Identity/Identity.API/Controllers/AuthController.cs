using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Responses;
using Shared.Security.Constants;
using System.Security.Claims;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IdentityDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        IdentityDbContext context,
        IPasswordHasher<AppUser> passwordHasher,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    /// <summary>
    /// Tạo tài khoản mới (Chỉ dành cho ADMIN tạo tài khoản Cán bộ & Học viên).
    /// </summary>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register([FromBody] RegisterRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
        {
            return BadRequest(ApiResponse<UserDto>.FailureResult("Tên đăng nhập đã tồn tại trong hệ thống."));
        }

        var adminUsername = User.Identity?.Name ?? "ADMIN";

        var user = new AppUser
        {
            Username = request.Username.Trim(),
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

        return CreatedAtAction(nameof(GetMe), null, ApiResponse<UserDto>.SuccessResult(resultDto, "Tạo tài khoản thành công."));
    }

    /// <summary>
    /// Đăng nhập hệ thống (Cấp phát Access Token + Refresh Token).
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
        if (user == null)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác."));
        }

        if (!user.IsActive)
        {
            return BadRequest(ApiResponse<AuthResponseDto>.FailureResult("Tài khoản của bạn đã bị vô hiệu hóa."));
        }

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác."));
        }

        var accessToken = _tokenService.GenerateToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var expiresIn = _configuration.GetValue<int>("JwtSettings:ExpirationMinutes", 120) * 60;

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            TokenType = "Bearer",
            ExpiresIn = expiresIn,
            UserId = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role.ToString().ToUpperInvariant(),
            RoleId = (int)user.Role
        };

        return Ok(ApiResponse<AuthResponseDto>.SuccessResult(response, "Đăng nhập thành công."));
    }

    /// <summary>
    /// Cấp mới Access Token khi hết hạn bằng Refresh Token (Token Rotation).
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var tokenEntity = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken);

        if (tokenEntity == null || !tokenEntity.IsActive || tokenEntity.User.IsDeleted || !tokenEntity.User.IsActive)
        {
            return Unauthorized(ApiResponse<AuthResponseDto>.FailureResult("Refresh Token không hợp lệ hoặc đã hết hạn."));
        }

        // Token rotation: Thu hồi token cũ và sinh token mới
        tokenEntity.RevokedAt = DateTime.UtcNow;
        var newRefreshToken = _tokenService.GenerateRefreshToken(tokenEntity.UserId);
        tokenEntity.ReplacedByToken = newRefreshToken.Token;

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        var newAccessToken = _tokenService.GenerateToken(tokenEntity.User);
        var expiresIn = _configuration.GetValue<int>("JwtSettings:ExpirationMinutes", 120) * 60;

        var response = new AuthResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            TokenType = "Bearer",
            ExpiresIn = expiresIn,
            UserId = tokenEntity.User.Id,
            Username = tokenEntity.User.Username,
            FullName = tokenEntity.User.FullName,
            Role = tokenEntity.User.Role.ToString().ToUpperInvariant(),
            RoleId = (int)tokenEntity.User.Role
        };

        return Ok(ApiResponse<AuthResponseDto>.SuccessResult(response, "Làm mới Token thành công."));
    }

    /// <summary>
    /// Đăng xuất: Thu hồi Refresh Token để chấm dứt phiên làm việc.
    /// </summary>
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<bool>>> Logout([FromBody] LogoutRequestDto? request)
    {
        if (!string.IsNullOrEmpty(request?.RefreshToken))
        {
            var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == request.RefreshToken);
            if (tokenEntity != null && tokenEntity.IsActive)
            {
                tokenEntity.RevokedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Đăng xuất thành công."));
    }

    /// <summary>
    /// Lấy thông tin tài khoản đang đăng nhập.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<UserDto>.FailureResult("Không tìm thấy thông tin xác thực người dùng."));
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.FailureResult("Người dùng không tồn tại."));
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
}
