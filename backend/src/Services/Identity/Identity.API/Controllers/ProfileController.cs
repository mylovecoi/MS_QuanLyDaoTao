using System.Security.Claims;
using Identity.API.DTOs;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Responses;

namespace Identity.API.Controllers;

[Authorize]
[ApiController]
[Route("api/auth/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetMyProfile()
    {
        var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<UserProfileDto>.FailureResult("Phiên làm việc không hợp lệ."));
        }

        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        if (profile == null)
        {
            return NotFound(ApiResponse<UserProfileDto>.FailureResult("Không tìm thấy thông tin hồ sơ người dùng."));
        }

        return Ok(ApiResponse<UserProfileDto>.SuccessResult(profile, "Lấy thông tin hồ sơ thành công."));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateMyProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<UserProfileDto>.FailureResult("Phiên làm việc không hợp lệ."));
        }

        var updated = await _profileService.UpdateProfileAsync(userId, dto);
        if (updated == null)
        {
            return BadRequest(ApiResponse<UserProfileDto>.FailureResult("Cập nhật thông tin hồ sơ thất bại."));
        }

        return Ok(ApiResponse<UserProfileDto>.SuccessResult(updated, "Cập nhật hồ sơ cá nhân thành công."));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<bool>.FailureResult("Phiên làm việc không hợp lệ."));
        }

        var (success, message) = await _profileService.ChangePasswordAsync(userId, dto);
        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult(message));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, message));
    }

    [HttpPost("avatar")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateAvatar([FromBody] UpdateAvatarDto dto)
    {
        var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<bool>.FailureResult("Phiên làm việc không hợp lệ."));
        }

        var success = await _profileService.UpdateAvatarAsync(userId, dto.AvatarUrl);
        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Cập nhật ảnh đại diện thất bại."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Cập nhật ảnh đại diện thành công."));
    }

    /// <summary>
    /// Admin xem thông tin hồ sơ chi tiết của bất kỳ tài khoản nào
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserProfile(Guid userId)
    {
        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        if (profile == null)
        {
            return NotFound(ApiResponse<UserProfileDto>.FailureResult("Không tìm thấy thông tin hồ sơ của tài khoản này."));
        }

        return Ok(ApiResponse<UserProfileDto>.SuccessResult(profile, "Lấy thông tin hồ sơ thành công."));
    }
}
