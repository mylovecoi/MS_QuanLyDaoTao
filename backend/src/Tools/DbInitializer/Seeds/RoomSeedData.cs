using Catalog.API.Entities;
using Shared.Common.Enums;

namespace DbInitializer.Seeds;

public static class RoomSeedData
{
    public static List<Room> GetRooms()
    {
        return new List<Room>
        {
            new Room
            {
                Id = Guid.NewGuid(),
                Name = "P.101",
                Address = "Giảng đường A - Tầng 1",
                Capacity = 60,
                Facilities = "Máy chiếu Sony, 2 điều hòa Daikin, Bảng trượt",
                Status = RoomStatus.Available,
                Notes = "Phòng học lý thuyết tiêu chuẩn",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "DbInitializer"
            },
            new Room
            {
                Id = Guid.NewGuid(),
                Name = "P.102",
                Address = "Giảng đường A - Tầng 1",
                Capacity = 60,
                Facilities = "Máy chiếu Panasonic, 2 điều hòa, Micro không dây",
                Status = RoomStatus.Available,
                Notes = "Phòng học lý thuyết tiêu chuẩn",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "DbInitializer"
            },
            new Room
            {
                Id = Guid.NewGuid(),
                Name = "P.201",
                Address = "Giảng đường B - Tầng 2",
                Capacity = 100,
                Facilities = "Hệ thống âm thanh hội thảo, 2 Máy chiếu 4K, Điều hòa trung tâm",
                Status = RoomStatus.Available,
                Notes = "Phòng học lớp ghép / Hội thảo chuyên đề",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "DbInitializer"
            },
            new Room
            {
                Id = Guid.NewGuid(),
                Name = "Lab.01",
                Address = "Khu Thực Hành CNTT - Tầng 3",
                Capacity = 40,
                Facilities = "40 PC Core i7/16GB RAM, Mạng cáp quang 1Gbps, Máy chiếu",
                Status = RoomStatus.Available,
                Notes = "Phòng thực hành Lập trình & Cơ sở dữ liệu",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "DbInitializer"
            },
            new Room
            {
                Id = Guid.NewGuid(),
                Name = "HoiTruong.C",
                Address = "Tòa nhà Trung Tâm",
                Capacity = 300,
                Facilities = "Màn hình LED 200 inch, Âm thanh sân khấu chuyên nghiệp, Máy lạnh công suất lớn",
                Status = RoomStatus.Maintenance,
                Notes = "Hội trường lớn - Đang bảo dưỡng hệ thống đèn sân khấu",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "DbInitializer"
            }
        };
    }
}
