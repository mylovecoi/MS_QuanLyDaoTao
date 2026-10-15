using System.Security.Claims;
using Identity.API.DTOs;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Responses;

namespace Identity.API.Controllers;

[Authorize(Roles = "ADMIN")]
[ApiController]
[Route("api/auth/permission-groups")]
public class PermissionGroupsController : ControllerBase
{
    private readonly IPermissionGroupService _permissionGroupService;

    public PermissionGroupsController(IPermissionGroupService permissionGroupService)
    {
        _permissionGroupService = permissionGroupService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PermissionGroupDto>>>> GetAll()
    {
        var groups = await _permissionGroupService.GetAllAsync();
        return Ok(ApiResponse<List<PermissionGroupDto>>.SuccessResult(groups, "Lấy danh sách nhóm quyền thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PermissionGroupDto>>> GetById(Guid id)
    {
        var group = await _permissionGroupService.GetByIdAsync(id);
        if (group == null)
        {
            return NotFound(ApiResponse<PermissionGroupDto>.FailureResult("Không tìm thấy nhóm quyền."));
        }

        return Ok(ApiResponse<PermissionGroupDto>.SuccessResult(group, "Lấy chi tiết nhóm quyền thành công."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PermissionGroupDto>>> Create([FromBody] CreatePermissionGroupDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _permissionGroupService.CreateAsync(dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<PermissionGroupDto>.FailureResult(message));
        }

        return CreatedAtAction(nameof(GetById), new { id = data.Id },
            ApiResponse<PermissionGroupDto>.SuccessResult(data, message));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PermissionGroupDto>>> Update(Guid id, [FromBody] UpdatePermissionGroupDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _permissionGroupService.UpdateAsync(id, dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<PermissionGroupDto>.FailureResult(message));
        }

        return Ok(ApiResponse<PermissionGroupDto>.SuccessResult(data, message));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _permissionGroupService.DeleteAsync(id, username);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy nhóm quyền để xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa nhóm quyền thành công."));
    }

    /// <summary>
    /// Lấy ma trận 6 quyền của Nhóm trên toàn bộ cây Menu
    /// </summary>
    [HttpGet("{id:guid}/matrix")]
    public async Task<ActionResult<ApiResponse<List<GroupPermissionMatrixItemDto>>>> GetMatrix(Guid id)
    {
        var matrix = await _permissionGroupService.GetMatrixAsync(id);
        return Ok(ApiResponse<List<GroupPermissionMatrixItemDto>>.SuccessResult(matrix, "Lấy ma trận phân quyền thành công."));
    }

    /// <summary>
    /// Lưu ma trận 6 quyền của Nhóm
    /// </summary>
    [HttpPut("{id:guid}/matrix")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateMatrix(Guid id, [FromBody] UpdatePermissionMatrixDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _permissionGroupService.UpdateMatrixAsync(id, dto, username);

        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Cập nhật ma trận phân quyền thất bại."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Cập nhật ma trận phân quyền thành công."));
    }

    /// <summary>
    /// Lấy danh sách thành viên thuộc Nhóm quyền
    /// </summary>
    [HttpGet("{id:guid}/members")]
    public async Task<ActionResult<ApiResponse<List<GroupMemberDto>>>> GetMembers(Guid id)
    {
        var members = await _permissionGroupService.GetMembersAsync(id);
        return Ok(ApiResponse<List<GroupMemberDto>>.SuccessResult(members, "Lấy danh sách thành viên thành công."));
    }

    /// <summary>
    /// Thêm danh sách cán bộ vào Nhóm quyền
    /// </summary>
    [HttpPost("{id:guid}/members")]
    public async Task<ActionResult<ApiResponse<bool>>> AddMembers(Guid id, [FromBody] AddGroupMembersDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _permissionGroupService.AddMembersAsync(id, dto.UserIds, username);
        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Không thể thêm cán bộ vào nhóm quyền."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Thêm cán bộ vào nhóm quyền thành công."));
    }

    /// <summary>
    /// Gỡ cán bộ khỏi Nhóm quyền
    /// </summary>
    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveMember(Guid id, Guid userId)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _permissionGroupService.RemoveMemberAsync(id, userId, username);
        if (!success)
        {
            return BadRequest(ApiResponse<bool>.FailureResult("Không tìm thấy cán bộ trong nhóm quyền để gỡ."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Gỡ cán bộ khỏi nhóm quyền thành công."));
    }

    /// <summary>
    /// Lấy danh sách cán bộ chưa thuộc nhóm hoặc đang thuộc nhóm khác để gán nhanh
    /// </summary>
    [HttpGet("{id:guid}/available-users")]
    public async Task<ActionResult<ApiResponse<List<GroupMemberDto>>>> GetAvailableUsers(Guid id)
    {
        var users = await _permissionGroupService.GetAvailableUsersAsync(id);
        return Ok(ApiResponse<List<GroupMemberDto>>.SuccessResult(users, "Lấy danh sách cán bộ khả dụng thành công."));
    }
}
