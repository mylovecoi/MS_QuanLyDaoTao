using Shared.Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace Catalog.API.DTOs;

public class RoomDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int Capacity { get; set; }
    public string? Facilities { get; set; }
    public string Status { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoomDto
{
    [Required(ErrorMessage = "Tên phòng học không được để trống")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Address { get; set; }

    [Range(1, 1000, ErrorMessage = "Sức chứa phòng học từ 1 đến 1000")]
    public int Capacity { get; set; }

    [MaxLength(500)]
    public string? Facilities { get; set; }

    public RoomStatus Status { get; set; } = RoomStatus.Available;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateRoomDto
{
    [Required(ErrorMessage = "Tên phòng học không được để trống")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Address { get; set; }

    [Range(1, 1000, ErrorMessage = "Sức chứa phòng học từ 1 đến 1000")]
    public int Capacity { get; set; }

    [MaxLength(500)]
    public string? Facilities { get; set; }

    public RoomStatus Status { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
