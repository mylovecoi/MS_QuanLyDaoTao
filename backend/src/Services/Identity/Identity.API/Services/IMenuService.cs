using Identity.API.DTOs;

namespace Identity.API.Services;

public interface IMenuService
{
    Task<List<MenuDto>> GetTreeAsync();
    Task<List<MenuDto>> GetFlatListAsync();
    Task<MenuDto?> GetByIdAsync(Guid id);
    Task<(bool Success, string Message, MenuDto? Data)> CreateAsync(CreateMenuDto dto, string createdBy);
    Task<(bool Success, string Message, MenuDto? Data)> UpdateAsync(Guid id, UpdateMenuDto dto, string updatedBy);
    Task<bool> ReorderBatchAsync(ReorderMenuBatchDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid id, string deletedBy);
    Task<List<DynamicMenuItemDto>> GetUserMenuPermissionsAsync(Guid userId);
}
