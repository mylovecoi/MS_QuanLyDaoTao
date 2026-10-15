using Shared.Common.Entities;

namespace Identity.API.Entities;

/// <summary>
/// Chi tiết quyền hạn của một Nhóm quyền (PermissionGroup) trên từng Menu chức năng
/// </summary>
public class PermissionGroupDetail : BaseEntity
{
    public Guid GroupId { get; set; }
    public virtual PermissionGroup Group { get; set; } = null!;

    public Guid MenuId { get; set; }
    public virtual AppMenu Menu { get; set; } = null!;

    // Ma trận 6 cờ phân quyền chuẩn theo hệ thống:
    public bool CanView { get; set; } = true;    // Tương đương quyền Index (Xem danh sách / truy cập menu)
    public bool CanCreate { get; set; } = false; // Thêm mới
    public bool CanEdit { get; set; } = false;   // Chỉnh sửa
    public bool CanDelete { get; set; } = false; // Xóa
    public bool CanApprove { get; set; } = false;// Phê duyệt (duyệt điểm, duyệt kế hoạch...)
    public bool CanPublic { get; set; } = false; // Công bố công khai
}
