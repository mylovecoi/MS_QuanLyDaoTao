using Shared.Common.Entities;

namespace Identity.API.Entities;

public class PermissionGroup : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Tên nhóm quyền (vd: Ban Giám Hiệu, Trưởng Khoa, Giảng Viên)
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual ICollection<AppUser> Users { get; set; } = new List<AppUser>();
    public virtual ICollection<PermissionGroupDetail> Permissions { get; set; } = new List<PermissionGroupDetail>();
}
