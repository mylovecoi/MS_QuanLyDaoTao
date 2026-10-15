namespace Identity.API.DTOs;

public class PermissionGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePermissionGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdatePermissionGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class GroupPermissionMatrixItemDto
{
    public Guid MenuId { get; set; }
    public string MenuCode { get; set; } = string.Empty;
    public string MenuTitle { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public int Level { get; set; }
    public int SortOrder { get; set; }

    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanPublic { get; set; }
}

public class UpdatePermissionMatrixDto
{
    public List<PermissionMatrixSaveItemDto> Permissions { get; set; } = new();
}

public class PermissionMatrixSaveItemDto
{
    public Guid MenuId { get; set; }
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanPublic { get; set; }
}

public class GroupMemberDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Avatar { get; set; }
    public string? StaffCode { get; set; }
    public string? Position { get; set; }
    public bool IsActive { get; set; }
}

public class AddGroupMembersDto
{
    public List<Guid> UserIds { get; set; } = new();
}
