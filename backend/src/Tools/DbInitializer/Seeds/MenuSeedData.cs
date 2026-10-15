using Identity.API.Entities;
using Shared.Common.Enums;

namespace DbInitializer.Seeds;

public static class MenuSeedData
{
    public static List<AppMenu> GetDefaultMenus()
    {
        var menus = new List<AppMenu>();

        // 1. Menu: Tổng quan (Dashboard)
        var dashboard = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "DASHBOARD",
            Title = "Bảng Điều Khiển",
            Path = "/dashboard",
            Icon = "DashboardOutlined",
            Level = 0,
            Type = MenuType.Item,
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(dashboard);

        // 2. Nhóm: Quản lý Người dùng
        var usersGroup = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "USER_MANAGEMENT_GROUP",
            Title = "Quản Lý Người Dùng",
            Path = null,
            Icon = "TeamOutlined",
            Level = 0,
            Type = MenuType.Group,
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(usersGroup);

        // 2.1 Cán bộ & Giảng viên
        var staffMenu = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "STAFF_MANAGE",
            Title = "Cán Bộ & Giảng Viên",
            Path = "/users/staff",
            Icon = "UserOutlined",
            ParentId = usersGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(staffMenu);

        // 2.2 Học viên & Sinh viên
        var studentMenu = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "STUDENT_MANAGE",
            Title = "Học Viên & Sinh Viên",
            Path = "/users/students",
            Icon = "IdcardOutlined",
            ParentId = usersGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(studentMenu);

        // 2.3 Tài khoản tổng hợp
        var allUsersMenu = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "ALL_USERS_MANAGE",
            Title = "Tài Khoản Tổng Hợp",
            Path = "/users/all",
            Icon = "UsergroupAddOutlined",
            ParentId = usersGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 3,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(allUsersMenu);

        // 3. Nhóm: Danh mục Đào tạo
        var catalogGroup = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "CATALOG_GROUP",
            Title = "Danh Mục Dùng Chung",
            Path = null,
            Icon = "AppstoreOutlined",
            Level = 0,
            Type = MenuType.Group,
            SortOrder = 3,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(catalogGroup);

        // 3.1 Phòng học
        var roomMenu = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "ROOM_MANAGE",
            Title = "Quản Lý Phòng Học",
            Path = "/catalog/rooms",
            Icon = "HomeOutlined",
            ParentId = catalogGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(roomMenu);

        // 4. Nhóm: Quản trị Hệ thống & Phân quyền
        var systemGroup = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "SYSTEM_GROUP",
            Title = "Cấu Hình & Phân Quyền",
            Path = null,
            Icon = "SettingOutlined",
            Level = 0,
            Type = MenuType.Group,
            SortOrder = 4,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(systemGroup);

        // 4.1 Quản lý Menu & Sắp xếp vị trí
        var menuManage = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "MENU_MANAGE",
            Title = "Cây Menu & Sắp Xếp",
            Path = "/system/menus",
            Icon = "MenuOutlined",
            ParentId = systemGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(menuManage);

        // 4.2 Nhóm quyền & Ma trận phân quyền
        var permGroupManage = new AppMenu
        {
            Id = Guid.NewGuid(),
            Code = "PERMISSION_GROUP_MANAGE",
            Title = "Nhóm Quyền & Ma Trận",
            Path = "/system/permission-groups",
            Icon = "SafetyCertificateOutlined",
            ParentId = systemGroup.Id,
            Level = 1,
            Type = MenuType.Item,
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "DbInitializer"
        };
        menus.Add(permGroupManage);

        return menus;
    }
}
