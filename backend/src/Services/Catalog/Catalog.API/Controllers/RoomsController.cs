using Catalog.API.DTOs;
using Catalog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Pagination;
using Shared.Common.Responses;
using System.Security.Claims;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/catalog/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<RoomDto>>>> GetPaged([FromQuery] PaginationFilter filter)
    {
        var result = await _roomService.GetPagedAsync(filter);
        return Ok(ApiResponse<PagedResult<RoomDto>>.SuccessResult(result, "Lấy danh sách phòng học thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> GetById(Guid id)
    {
        var room = await _roomService.GetByIdAsync(id);
        if (room == null)
        {
            return NotFound(ApiResponse<RoomDto>.FailureResult("Không tìm thấy thông tin phòng học."));
        }

        return Ok(ApiResponse<RoomDto>.SuccessResult(room, "Lấy chi tiết phòng học thành công."));
    }

    [Authorize(Roles = "ADMIN,CANBO")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Create([FromBody] CreateRoomDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var createdRoom = await _roomService.CreateAsync(dto, username);

        return CreatedAtAction(nameof(GetById), new { id = createdRoom.Id }, 
            ApiResponse<RoomDto>.SuccessResult(createdRoom, "Thêm mới phòng học thành công."));
    }

    [Authorize(Roles = "ADMIN,CANBO")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Update(Guid id, [FromBody] UpdateRoomDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var updated = await _roomService.UpdateAsync(id, dto, username);
        if (updated == null)
        {
            return NotFound(ApiResponse<RoomDto>.FailureResult("Không tìm thấy phòng học để cập nhật."));
        }

        return Ok(ApiResponse<RoomDto>.SuccessResult(updated, "Cập nhật phòng học thành công."));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _roomService.DeleteAsync(id, username);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy phòng học để xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa mềm phòng học thành công."));
    }
}
