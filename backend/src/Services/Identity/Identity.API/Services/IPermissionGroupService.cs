using Identity.API.DTOs;

namespace Identity.API.Services;

public interface IPermissionGroupService
{
    Task<List<PermissionGroupDto>> GetAllAsync();
    Task<PermissionGroupDto?> GetByIdAsync(Guid id);
    Task<(bool Success, string Message, PermissionGroupDto? Data)> CreateAsync(CreatePermissionGroupDto dto, string createdBy);
    Task<(bool Success, string Message, PermissionGroupDto? Data)> UpdateAsync(Guid id, UpdatePermissionGroupDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid id, string deletedBy);
    Task<List<GroupPermissionMatrixItemDto>> GetMatrixAsync(Guid groupId);
    Task<bool> UpdateMatrixAsync(Guid groupId, UpdatePermissionMatrixDto dto, string updatedBy);
    Task<List<GroupMemberDto>> GetMembersAsync(Guid groupId);
    Task<bool> AddMembersAsync(Guid groupId, List<Guid> userIds, string updatedBy);
    Task<bool> RemoveMemberAsync(Guid groupId, Guid userId, string updatedBy);
    Task<List<GroupMemberDto>> GetAvailableUsersAsync(Guid groupId);
}
