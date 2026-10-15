using Shared.Common.Entities;
using Shared.Common.Enums;

namespace Identity.API.Entities;

public class AppMenu : BaseEntity
{
    public string Code { get; set; } = string.Empty; // Mã định danh phân quyền (vd: ROOM_MANAGE, CLASS_MANAGE)
    public string Title { get; set; } = string.Empty; // Tên hiển thị trên menu
    public string? Path { get; set; } // Đường dẫn route React (vd: /catalog/rooms)
    public string? Icon { get; set; } // Tên icon Ant Design (vd: AppstoreOutlined, TeamOutlined)
    
    public Guid? ParentId { get; set; } // Khóa ngoại tự tham chiếu tạo cây menu cha - con
    public virtual AppMenu? Parent { get; set; }
    public virtual ICollection<AppMenu> Children { get; set; } = new List<AppMenu>();

    public int Level { get; set; } = 0; // Cấp bậc: 0 = Nhóm chính, 1 = Submenu, 2 = Chức năng con
    public MenuType Type { get; set; } = MenuType.Item; // Group / Item
    
    /// <summary>
    /// Số thứ tự sắp xếp vị trí hiển thị trên thanh Menu (tương đương STTSapXep ở dự án cũ)
    /// </summary>
    public int SortOrder { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;

    public virtual ICollection<PermissionGroupDetail> Permissions { get; set; } = new List<PermissionGroupDetail>();
}
