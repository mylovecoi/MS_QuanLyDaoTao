using Shared.Common.Entities;
using Shared.Common.Enums;

namespace Catalog.API.Entities;

public class Room : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int Capacity { get; set; }
    public string? Facilities { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public string? Notes { get; set; }
}
