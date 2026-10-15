using Identity.API.DTOs;
using Shared.Common.Pagination;

namespace Identity.API.Services;

public interface IStaffService
{
    Task<PagedResult<StaffItemDto>> GetPagedAsync(StaffFilterDto filter);
    Task<StaffItemDto?> GetByIdAsync(Guid userId);
    Task<(bool Success, string Message, StaffItemDto? Data)> CreateAsync(CreateStaffDto dto, string createdBy);
    Task<(bool Success, string Message, StaffItemDto? Data)> UpdateAsync(Guid userId, UpdateStaffDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid userId, string deletedBy);
}
