using Identity.API.Data;
using Identity.API.DTOs;
using Identity.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Services;

public class PermissionGroupService : IPermissionGroupService
{
    private readonly IdentityDbContext _context;

    public PermissionGroupService(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<List<PermissionGroupDto>> GetAllAsync()
    {
        var groups = await _context.PermissionGroups
            .Include(g => g.Users)
            .OrderByDescending(g => g.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return groups.Select(g => new PermissionGroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            IsActive = g.IsActive,
            UserCount = g.Users.Count(u => !u.IsDeleted),
            CreatedAt = g.CreatedAt
        }).ToList();
    }

    public async Task<PermissionGroupDto?> GetByIdAsync(Guid id)
    {
        var g = await _context.PermissionGroups
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (g == null) return null;

        return new PermissionGroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            IsActive = g.IsActive,
            UserCount = g.Users.Count(u => !u.IsDeleted),
            CreatedAt = g.CreatedAt
        };
    }

    public async Task<(bool Success, string Message, PermissionGroupDto? Data)> CreateAsync(CreatePermissionGroupDto dto, string createdBy)
    {
        if (await _context.PermissionGroups.AnyAsync(g => g.Name == dto.Name.Trim()))
        {
            return (false, "Tên nhóm quyền đã tồn tại.", null);
        }

        var group = new PermissionGroup
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            IsActive = true,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.PermissionGroups.Add(group);
        await _context.SaveChangesAsync();

        return (true, "Tạo nhóm quyền thành công.", await GetByIdAsync(group.Id));
    }

    public async Task<(bool Success, string Message, PermissionGroupDto? Data)> UpdateAsync(Guid id, UpdatePermissionGroupDto dto, string updatedBy)
    {
        var group = await _context.PermissionGroups.FindAsync(id);
        if (group == null) return (false, "Không tìm thấy nhóm quyền.", null);

        if (await _context.PermissionGroups.AnyAsync(g => g.Name == dto.Name.Trim() && g.Id != id))
        {
            return (false, "Tên nhóm quyền đã bị trùng lặp.", null);
        }

        group.Name = dto.Name.Trim();
        group.Description = dto.Description?.Trim();
        group.IsActive = dto.IsActive;
        group.UpdatedAt = DateTime.UtcNow;
        group.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();
        return (true, "Cập nhật nhóm quyền thành công.", await GetByIdAsync(id));
    }

    public async Task<bool> DeleteAsync(Guid id, string deletedBy)
    {
        var group = await _context.PermissionGroups
            .Include(g => g.Permissions)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group == null) return false;

        group.IsDeleted = true;
        group.DeletedAt = DateTime.UtcNow;
        group.DeletedBy = deletedBy;

        // Xóa mềm các permissions liên kết
        foreach (var p in group.Permissions)
        {
            p.IsDeleted = true;
            p.DeletedAt = DateTime.UtcNow;
            p.DeletedBy = deletedBy;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<GroupPermissionMatrixItemDto>> GetMatrixAsync(Guid groupId)
    {
        var allMenus = await _context.Menus
            .Where(m => m.IsActive)
            .AsNoTracking()
            .ToListAsync();

        // Sắp xếp tuần tự theo Cây Phân Cấp: Menu Cha -> Các Menu Con của nó -> Menu tiếp theo
        var roots = allMenus.Where(m => m.ParentId == null).OrderBy(m => m.SortOrder).ToList();
        var orderedMenus = new List<AppMenu>();

        void AddMenuHierarchy(AppMenu parent)
        {
            orderedMenus.Add(parent);
            var children = allMenus.Where(m => m.ParentId == parent.Id).OrderBy(m => m.SortOrder).ToList();
            foreach (var child in children)
            {
                AddMenuHierarchy(child);
            }
        }

        foreach (var root in roots)
        {
            AddMenuHierarchy(root);
        }

        // Đảm bảo không sót menu nào
        foreach (var m in allMenus.Where(m => !orderedMenus.Any(o => o.Id == m.Id)))
        {
            orderedMenus.Add(m);
        }

        var existingPerms = await _context.PermissionGroupDetails
            .Where(p => p.GroupId == groupId)
            .AsNoTracking()
            .ToListAsync();

        var permDict = existingPerms.ToDictionary(p => p.MenuId);

        return orderedMenus.Select(m =>
        {
            permDict.TryGetValue(m.Id, out var p);

            return new GroupPermissionMatrixItemDto
            {
                MenuId = m.Id,
                MenuCode = m.Code,
                MenuTitle = m.Title,
                ParentId = m.ParentId,
                Level = m.Level,
                SortOrder = m.SortOrder,
                CanView = p?.CanView ?? false,
                CanCreate = p?.CanCreate ?? false,
                CanEdit = p?.CanEdit ?? false,
                CanDelete = p?.CanDelete ?? false,
                CanApprove = p?.CanApprove ?? false,
                CanPublic = p?.CanPublic ?? false
            };
        }).ToList();
    }

    public async Task<bool> UpdateMatrixAsync(Guid groupId, UpdatePermissionMatrixDto dto, string updatedBy)
    {
        var group = await _context.PermissionGroups.FindAsync(groupId);
        if (group == null) return false;

        var existingPerms = await _context.PermissionGroupDetails
            .Where(p => p.GroupId == groupId)
            .ToListAsync();

        var saveDict = dto.Permissions.ToDictionary(p => p.MenuId);

        // Cập nhật hoặc thêm mới
        foreach (var item in dto.Permissions)
        {
            var perm = existingPerms.FirstOrDefault(p => p.MenuId == item.MenuId);
            if (perm != null)
            {
                perm.CanView = item.CanView;
                perm.CanCreate = item.CanCreate;
                perm.CanEdit = item.CanEdit;
                perm.CanDelete = item.CanDelete;
                perm.CanApprove = item.CanApprove;
                perm.CanPublic = item.CanPublic;
                perm.UpdatedAt = DateTime.UtcNow;
                perm.UpdatedBy = updatedBy;
            }
            else
            {
                _context.PermissionGroupDetails.Add(new PermissionGroupDetail
                {
                    GroupId = groupId,
                    MenuId = item.MenuId,
                    CanView = item.CanView,
                    CanCreate = item.CanCreate,
                    CanEdit = item.CanEdit,
                    CanDelete = item.CanDelete,
                    CanApprove = item.CanApprove,
                    CanPublic = item.CanPublic,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = updatedBy
                });
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<GroupMemberDto>> GetMembersAsync(Guid groupId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.StaffProfile)
            .Where(u => u.PermissionGroupId == groupId && !u.IsDeleted)
            .OrderBy(u => u.FullName)
            .Select(u => new GroupMemberDto
            {
                UserId = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Avatar = u.Avatar,
                StaffCode = u.StaffProfile != null ? u.StaffProfile.StaffCode : string.Empty,
                Position = u.Position,
                IsActive = u.IsActive
            })
            .ToListAsync();
    }

    public async Task<bool> AddMembersAsync(Guid groupId, List<Guid> userIds, string updatedBy)
    {
        var group = await _context.PermissionGroups.FindAsync(groupId);
        if (group == null || userIds.Count == 0) return false;

        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();

        foreach (var user in users)
        {
            user.PermissionGroupId = groupId;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = updatedBy;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid groupId, Guid userId, string updatedBy)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.PermissionGroupId == groupId);
        if (user == null) return false;

        user.PermissionGroupId = null;
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = updatedBy;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<GroupMemberDto>> GetAvailableUsersAsync(Guid groupId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.StaffProfile)
            .Where(u => !u.IsDeleted && u.UserType == Shared.Common.Enums.UserType.Staff && (u.PermissionGroupId == null || u.PermissionGroupId != groupId))
            .OrderBy(u => u.FullName)
            .Select(u => new GroupMemberDto
            {
                UserId = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Avatar = u.Avatar,
                StaffCode = u.StaffProfile != null ? u.StaffProfile.StaffCode : string.Empty,
                Position = u.Position,
                IsActive = u.IsActive
            })
            .ToListAsync();
    }
}
