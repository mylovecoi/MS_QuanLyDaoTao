using Identity.API.DTOs;

namespace Identity.API.Services;

public interface IProfileService
{
    Task<UserProfileDto?> GetProfileByUserIdAsync(Guid userId);
    Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<(bool Success, string Message)> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<bool> UpdateAvatarAsync(Guid userId, string avatarUrl);
}
