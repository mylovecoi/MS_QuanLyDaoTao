using Shared.Common.Entities;

namespace Identity.API.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual AppUser User { get; set; } = null!;

    public string StudentCode { get; set; } = string.Empty;
    public Guid? ClassId { get; set; } // Khóa tham chiếu logic tới Lớp Học (Academic.API)
    public Guid? ClassPositionId { get; set; } // Chức vụ lớp (Lớp trưởng, Bí thư...)
    
    public string? Workplace { get; set; } // Cơ quan cử đi học (hệ bồi dưỡng/vừa làm vừa học)
    public string? TrainingResult { get; set; } // Kết quả đào tạo / tốt nghiệp
}
