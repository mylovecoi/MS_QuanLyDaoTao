using Catalog.API.Data;
using Catalog.API.DTOs;
using Catalog.API.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Pagination;

namespace Catalog.API.Services;

public class RoomService : IRoomService
{
    private readonly CatalogDbContext _context;

    public RoomService(CatalogDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<RoomDto>> GetPagedAsync(PaginationFilter filter)
    {
        var query = _context.Rooms.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(r => r.Name.ToLower().Contains(term) || (r.Address != null && r.Address.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                Name = r.Name,
                Address = r.Address,
                Capacity = r.Capacity,
                Facilities = r.Facilities,
                Status = r.Status.ToString(),
                StatusId = (int)r.Status,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<RoomDto>(items, totalRecords, filter.PageNumber, filter.PageSize);
    }

    public async Task<RoomDto?> GetByIdAsync(Guid id)
    {
        var r = await _context.Rooms.FindAsync(id);
        if (r == null) return null;

        return new RoomDto
        {
            Id = r.Id,
            Name = r.Name,
            Address = r.Address,
            Capacity = r.Capacity,
            Facilities = r.Facilities,
            Status = r.Status.ToString(),
            StatusId = (int)r.Status,
            Notes = r.Notes,
            CreatedAt = r.CreatedAt
        };
    }

    public async Task<RoomDto> CreateAsync(CreateRoomDto dto, string createdBy)
    {
        var room = new Room
        {
            Name = dto.Name.Trim(),
            Address = dto.Address?.Trim(),
            Capacity = dto.Capacity,
            Facilities = dto.Facilities?.Trim(),
            Status = dto.Status,
            Notes = dto.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Address = room.Address,
            Capacity = room.Capacity,
            Facilities = room.Facilities,
            Status = room.Status.ToString(),
            StatusId = (int)room.Status,
            Notes = room.Notes,
            CreatedAt = room.CreatedAt
        };
    }

    public async Task<RoomDto?> UpdateAsync(Guid id, UpdateRoomDto dto, string updatedBy)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null) return null;

        room.Name = dto.Name.Trim();
        room.Address = dto.Address?.Trim();
        room.Capacity = dto.Capacity;
        room.Facilities = dto.Facilities?.Trim();
        room.Status = dto.Status;
        room.Notes = dto.Notes?.Trim();
        room.UpdatedAt = DateTime.UtcNow;
        room.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();

        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Address = room.Address,
            Capacity = room.Capacity,
            Facilities = room.Facilities,
            Status = room.Status.ToString(),
            StatusId = (int)room.Status,
            Notes = room.Notes,
            CreatedAt = room.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(Guid id, string deletedBy)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null) return false;

        // Xóa mềm (Soft Delete)
        room.IsDeleted = true;
        room.DeletedAt = DateTime.UtcNow;
        room.DeletedBy = deletedBy;

        await _context.SaveChangesAsync();
        return true;
    }
}
