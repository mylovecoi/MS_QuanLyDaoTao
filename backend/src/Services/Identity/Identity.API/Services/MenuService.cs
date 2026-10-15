using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.EntityFrameworkCore;
using Shared.Common.Enums;

namespace Identity.API.Services;

public class MenuService : IMenuService
{
    private readonly IdentityDbContext _context;

    public MenuService(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuDto>> GetFlatListAsync()
    {
        var menus = await _context.Menus
            .Include(m => m.Parent)
            .OrderBy(m => m.Level)
            .ThenBy(m => m.SortOrder)
            .AsNoTracking()
            .ToListAsync();

        return menus.Select(m => new MenuDto
        {
            Id = m.Id,
            Code = m.Code,
            Title = m.Title,
            Path = m.Path,
            Icon = m.Icon,
            ParentId = m.ParentId,
            ParentTitle = m.Parent?.Title,
            Level = m.Level,
            Type = m.Type,
            SortOrder = m.SortOrder,
            IsActive = m.IsActive
        }).ToList();
    }

    public async Task<List<MenuDto>> GetTreeAsync()
    {
        var allMenus = await _context.Menus
            .OrderBy(m => m.SortOrder)
            .AsNoTracking()
            .ToListAsync();

        var lookup = allMenus.ToDictionary(m => m.Id, m => new MenuDto
        {
            Id = m.Id,
            Code = m.Code,
            Title = m.Title,
            Path = m.Path,
            Icon = m.Icon,
            ParentId = m.ParentId,
            Level = m.Level,
            Type = m.Type,
            SortOrder = m.SortOrder,
            IsActive = m.IsActive
        });

        var rootItems = new List<MenuDto>();

        foreach (var item in allMenus)
        {
            var dto = lookup[item.Id];
            if (item.ParentId.HasValue && lookup.TryGetValue(item.ParentId.Value, out var parentDto))
            {
                parentDto.Children.Add(dto);
            }
            else
            {
                rootItems.Add(dto);
            }
        }

        return rootItems.OrderBy(r => r.SortOrder).ToList();
    }

    public async Task<MenuDto?> GetByIdAsync(Guid id)
    {
        var m = await _context.Menus
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return null;

        return new MenuDto
        {
            Id = m.Id,
            Code = m.Code,
            Title = m.Title,
            Path = m.Path,
            Icon = m.Icon,
            ParentId = m.ParentId,
            ParentTitle = m.Parent?.Title,
            Level = m.Level,
            Type = m.Type,
            SortOrder = m.SortOrder,
            IsActive = m.IsActive
        };
    }

    public async Task<(bool Success, string Message, MenuDto? Data)> CreateAsync(CreateMenuDto dto, string createdBy)
    {
        if (await _context.Menus.AnyAsync(m => m.Code == dto.Code.Trim()))
        {
            return (false, "Mã phân quyền (Code) của menu đã tồn tại.", null);
        }

        int calculatedLevel = 0;
        if (dto.ParentId.HasValue && dto.ParentId.Value != Guid.Empty)
        {
            var parent = await _context.Menus.FindAsync(dto.ParentId.Value);
            calculatedLevel = (parent?.Level ?? 0) + 1;
        }

        var menu = new AppMenu
        {
            Code = dto.Code.Trim().ToUpper(),
            Title = dto.Title.Trim(),
            Path = dto.Path?.Trim(),
            Icon = dto.Icon?.Trim(),
            ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId,
            Level = calculatedLevel,
            Type = dto.ParentId.HasValue && dto.ParentId.Value != Guid.Empty ? MenuType.Item : dto.Type,
            SortOrder = dto.SortOrder,
            IsActive = true,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.Menus.Add(menu);
        await _context.SaveChangesAsync();

        return (true, "Thêm mới menu thành công.", await GetByIdAsync(menu.Id));
    }

    public async Task<(bool Success, string Message, MenuDto? Data)> UpdateAsync(Guid id, UpdateMenuDto dto, string updatedBy)
    {
        var menu = await _context.Menus.FindAsync(id);
        if (menu == null) return (false, "Không tìm thấy menu để cập nhật.", null);

        if (await _context.Menus.AnyAsync(m => m.Code == dto.Code.Trim() && m.Id != id))
        {
            return (false, "Mã phân quyền (Code) đã bị trùng với menu khác.", null);
        }

        int calculatedLevel = 0;
        if (dto.ParentId.HasValue && dto.ParentId.Value != Guid.Empty)
        {
            var parent = await _context.Menus.FindAsync(dto.ParentId.Value);
            calculatedLevel = (parent?.Level ?? 0) + 1;
        }

        menu.Code = dto.Code.Trim().ToUpper();
        menu.Title = dto.Title.Trim();
        menu.Path = dto.Path?.Trim();
        menu.Icon = dto.Icon?.Trim();
        menu.ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId;
        menu.Level = calculatedLevel;
        menu.Type = dto.ParentId.HasValue && dto.ParentId.Value != Guid.Empty ? MenuType.Item : dto.Type;
        menu.SortOrder = dto.SortOrder;
        menu.IsActive = dto.IsActive;
        menu.UpdatedAt = DateTime.UtcNow;
        menu.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();
        return (true, "Cập nhật menu thành công.", await GetByIdAsync(id));
    }

    public async Task<bool> ReorderBatchAsync(ReorderMenuBatchDto dto, string updatedBy)
    {
        if (dto.Items == null || !dto.Items.Any()) return true;

        var ids = dto.Items.Select(x => x.Id).ToList();
        var menus = await _context.Menus.Where(m => ids.Contains(m.Id)).ToListAsync();

        foreach (var item in dto.Items)
        {
            var menu = menus.FirstOrDefault(m => m.Id == item.Id);
            if (menu != null)
            {
                menu.SortOrder = item.SortOrder;
                if (item.ParentId != Guid.Empty)
                {
                    menu.ParentId = item.ParentId;
                }
                menu.UpdatedAt = DateTime.UtcNow;
                menu.UpdatedBy = updatedBy;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string deletedBy)
    {
        var menu = await _context.Menus.FindAsync(id);
        if (menu == null) return false;

        menu.IsDeleted = true;
        menu.DeletedAt = DateTime.UtcNow;
        menu.DeletedBy = deletedBy;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DynamicMenuItemDto>> GetUserMenuPermissionsAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.PermissionGroup)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return new List<DynamicMenuItemDto>();

        // Toàn bộ menu hệ thống
        var allMenus = await _context.Menus
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .AsNoTracking()
            .ToListAsync();

        // Nếu là Super Admin (SSA) -> full quyền tất cả menu
        if (user.IsSuperAdmin || user.Role == UserRole.Admin)
        {
            return BuildDynamicTree(allMenus, null, isFullAccess: true);
        }

        // Nếu có nhóm quyền: Lấy bảng permissions chi tiết
        var permissions = new Dictionary<Guid, PermissionGroupDetail>();
        if (user.PermissionGroupId.HasValue)
        {
            var perms = await _context.PermissionGroupDetails
                .Where(p => p.GroupId == user.PermissionGroupId.Value && p.CanView)
                .AsNoTracking()
                .ToListAsync();

            permissions = perms.ToDictionary(p => p.MenuId);
        }

        // Lọc menu có quyền xem hoặc có con có quyền xem
        var allowedMenuIds = new HashSet<Guid>(permissions.Keys);

        // Thêm các menu cha của các menu được phép
        foreach (var menu in allMenus)
        {
            if (allowedMenuIds.Contains(menu.Id) && menu.ParentId.HasValue)
            {
                AddParentsToAllowed(menu.ParentId.Value, allMenus, allowedMenuIds);
            }
        }

        var filteredMenus = allMenus.Where(m => allowedMenuIds.Contains(m.Id)).ToList();
        return BuildDynamicTree(filteredMenus, permissions, isFullAccess: false);
    }

    private static void AddParentsToAllowed(Guid parentId, List<AppMenu> allMenus, HashSet<Guid> allowedIds)
    {
        if (allowedIds.Add(parentId))
        {
            var parent = allMenus.FirstOrDefault(m => m.Id == parentId);
            if (parent?.ParentId != null)
            {
                AddParentsToAllowed(parent.ParentId.Value, allMenus, allowedIds);
            }
        }
    }

    private static List<DynamicMenuItemDto> BuildDynamicTree(
        List<AppMenu> menus,
        Dictionary<Guid, PermissionGroupDetail>? permissions,
        bool isFullAccess)
    {
        var lookup = menus.ToDictionary(m => m.Id, m =>
        {
            var actions = new MenuActionsDto
            {
                CanView = true,
                CanCreate = isFullAccess,
                CanEdit = isFullAccess,
                CanDelete = isFullAccess,
                CanApprove = isFullAccess,
                CanPublic = isFullAccess
            };

            if (!isFullAccess && permissions != null && permissions.TryGetValue(m.Id, out var perm))
            {
                actions.CanView = perm.CanView;
                actions.CanCreate = perm.CanCreate;
                actions.CanEdit = perm.CanEdit;
                actions.CanDelete = perm.CanDelete;
                actions.CanApprove = perm.CanApprove;
                actions.CanPublic = perm.CanPublic;
            }

            return new DynamicMenuItemDto
            {
                Id = m.Id,
                Code = m.Code,
                Title = m.Title,
                Path = m.Path,
                Icon = m.Icon,
                SortOrder = m.SortOrder,
                Actions = actions
            };
        });

        var rootItems = new List<DynamicMenuItemDto>();

        foreach (var item in menus)
        {
            var dto = lookup[item.Id];
            if (item.ParentId.HasValue && lookup.TryGetValue(item.ParentId.Value, out var parentDto))
            {
                parentDto.Children.Add(dto);
            }
            else
            {
                rootItems.Add(dto);
            }
        }

        return rootItems.OrderBy(r => r.SortOrder).ToList();
    }
}
