using System.Security.Claims;
using Identity.API.DTOs;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Responses;

namespace Identity.API.Controllers;

[Authorize]
[ApiController]
[Route("api/auth/[controller]")]
public class MenusController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenusController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    [HttpGet]
    [HttpGet("tree")]
    public async Task<ActionResult<ApiResponse<List<MenuDto>>>> GetTree()
    {
        var tree = await _menuService.GetTreeAsync();
        return Ok(ApiResponse<List<MenuDto>>.SuccessResult(tree, "Lấy cây menu thành công."));
    }

    [HttpGet("flat")]
    public async Task<ActionResult<ApiResponse<List<MenuDto>>>> GetFlat()
    {
        var list = await _menuService.GetFlatListAsync();
        return Ok(ApiResponse<List<MenuDto>>.SuccessResult(list, "Lấy danh sách menu phẳng thành công."));
    }

    [HttpGet("my-permissions")]
    public async Task<ActionResult<ApiResponse<List<DynamicMenuItemDto>>>> GetMyMenuPermissions()
    {
        var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<List<DynamicMenuItemDto>>.FailureResult("Phiên làm việc không hợp lệ."));
        }

        var dynamicMenu = await _menuService.GetUserMenuPermissionsAsync(userId);
        return Ok(ApiResponse<List<DynamicMenuItemDto>>.SuccessResult(dynamicMenu, "Lấy danh sách menu phân quyền thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<MenuDto>>> GetById(Guid id)
    {
        var menu = await _menuService.GetByIdAsync(id);
        if (menu == null)
        {
            return NotFound(ApiResponse<MenuDto>.FailureResult("Không tìm thấy thông tin menu."));
        }

        return Ok(ApiResponse<MenuDto>.SuccessResult(menu, "Lấy chi tiết menu thành công."));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<MenuDto>>> Create([FromBody] CreateMenuDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _menuService.CreateAsync(dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<MenuDto>.FailureResult(message));
        }

        return CreatedAtAction(nameof(GetById), new { id = data.Id },
            ApiResponse<MenuDto>.SuccessResult(data, message));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<MenuDto>>> Update(Guid id, [FromBody] UpdateMenuDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _menuService.UpdateAsync(id, dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<MenuDto>.FailureResult(message));
        }

        return Ok(ApiResponse<MenuDto>.SuccessResult(data, message));
    }

    /// <summary>
    /// API sắp xếp thứ tự hiển thị của các mục Menu (SortOrder)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpPut("reorder")]
    public async Task<ActionResult<ApiResponse<bool>>> ReorderBatch([FromBody] ReorderMenuBatchDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _menuService.ReorderBatchAsync(dto, username);

        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Cập nhật thứ tự sắp xếp menu thất bại."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Cập nhật thứ tự menu thành công."));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _menuService.DeleteAsync(id, username);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy menu để xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa mềm menu thành công."));
    }
}
