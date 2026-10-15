using System.Security.Claims;
using Identity.API.DTOs;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Pagination;
using Shared.Common.Responses;

namespace Identity.API.Controllers;

[Authorize(Roles = "ADMIN,CANBO")]
[ApiController]
[Route("api/auth/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<StaffItemDto>>>> GetPaged([FromQuery] StaffFilterDto filter)
    {
        var result = await _staffService.GetPagedAsync(filter);
        return Ok(ApiResponse<PagedResult<StaffItemDto>>.SuccessResult(result, "Lấy danh sách cán bộ thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StaffItemDto>>> GetById(Guid id)
    {
        var staff = await _staffService.GetByIdAsync(id);
        if (staff == null)
        {
            return NotFound(ApiResponse<StaffItemDto>.FailureResult("Không tìm thấy thông tin cán bộ."));
        }

        return Ok(ApiResponse<StaffItemDto>.SuccessResult(staff, "Lấy chi tiết cán bộ thành công."));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<StaffItemDto>>> Create([FromBody] CreateStaffDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _staffService.CreateAsync(dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<StaffItemDto>.FailureResult(message));
        }

        return CreatedAtAction(nameof(GetById), new { id = data.Id },
            ApiResponse<StaffItemDto>.SuccessResult(data, message));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StaffItemDto>>> Update(Guid id, [FromBody] UpdateStaffDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _staffService.UpdateAsync(id, dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<StaffItemDto>.FailureResult(message));
        }

        return Ok(ApiResponse<StaffItemDto>.SuccessResult(data, message));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _staffService.DeleteAsync(id, username);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy cán bộ để xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa mềm cán bộ thành công."));
    }
}
