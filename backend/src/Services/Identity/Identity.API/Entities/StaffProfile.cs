using Shared.Common.Entities;
using Shared.Common.Enums;

namespace Identity.API.Entities;

public class StaffProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual AppUser User { get; set; } = null!;

    public string StaffCode { get; set; } = string.Empty;
    public StaffType StaffType { get; set; } = StaffType.Teacher;
    public Guid? DepartmentId { get; set; } // Khóa tham chiếu logic tới Danh Mục Đơn Vị (Catalog.API)
    
    public string? SignTitle { get; set; } // Chức danh người ký duyệt (vd: Trưởng Phòng Đào Tạo)
    public string? SignFullName { get; set; } // Họ tên người ký hiển thị
}
