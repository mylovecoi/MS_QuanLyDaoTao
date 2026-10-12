using Catalog.API.DTOs;
using Shared.Common.Enums;
using Shared.Common.Pagination;

namespace Catalog.API.Services;

public interface IRoomService
{
    Task<PagedResult<RoomDto>> GetPagedAsync(PaginationFilter filter, RoomStatus? status = null);
    Task<RoomDto?> GetByIdAsync(Guid id);
    Task<RoomDto> CreateAsync(CreateRoomDto dto, string createdBy);
    Task<RoomDto?> UpdateAsync(Guid id, UpdateRoomDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid id, string deletedBy);
}
