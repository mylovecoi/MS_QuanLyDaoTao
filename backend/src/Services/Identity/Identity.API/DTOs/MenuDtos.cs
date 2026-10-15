using Shared.Common.Enums;

namespace Identity.API.DTOs;

public class MenuDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public Guid? ParentId { get; set; }
    public string? ParentTitle { get; set; }
    public int Level { get; set; }
    public MenuType Type { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<MenuDto> Children { get; set; } = new();
}

public class CreateMenuDto
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public Guid? ParentId { get; set; }
    public int Level { get; set; } = 0;
    public MenuType Type { get; set; } = MenuType.Item;
    public int SortOrder { get; set; } = 0;
}

public class UpdateMenuDto
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public Guid? ParentId { get; set; }
    public int Level { get; set; }
    public MenuType Type { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class ReorderMenuItemDto
{
    public Guid Id { get; set; }
    public int SortOrder { get; set; }
    public Guid? ParentId { get; set; }
}

public class ReorderMenuBatchDto
{
    public List<ReorderMenuItemDto> Items { get; set; } = new();
}

public class DynamicMenuItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public MenuActionsDto Actions { get; set; } = new();
    public List<DynamicMenuItemDto> Children { get; set; } = new();
}

public class MenuActionsDto
{
    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; } = false;
    public bool CanEdit { get; set; } = false;
    public bool CanDelete { get; set; } = false;
    public bool CanApprove { get; set; } = false;
    public bool CanPublic { get; set; } = false;
}
