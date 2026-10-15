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
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<StudentItemDto>>>> GetPaged([FromQuery] StudentFilterDto filter)
    {
        var result = await _studentService.GetPagedAsync(filter);
        return Ok(ApiResponse<PagedResult<StudentItemDto>>.SuccessResult(result, "Lấy danh sách học viên thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StudentItemDto>>> GetById(Guid id)
    {
        var student = await _studentService.GetByIdAsync(id);
        if (student == null)
        {
            return NotFound(ApiResponse<StudentItemDto>.FailureResult("Không tìm thấy thông tin học viên."));
        }

        return Ok(ApiResponse<StudentItemDto>.SuccessResult(student, "Lấy chi tiết học viên thành công."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<StudentItemDto>>> Create([FromBody] CreateStudentDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _studentService.CreateAsync(dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<StudentItemDto>.FailureResult(message));
        }

        return CreatedAtAction(nameof(GetById), new { id = data.Id },
            ApiResponse<StudentItemDto>.SuccessResult(data, message));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StudentItemDto>>> Update(Guid id, [FromBody] UpdateStudentDto dto)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var (success, message, data) = await _studentService.UpdateAsync(id, dto, username);

        if (!success || data == null)
        {
            return BadRequest(ApiResponse<StudentItemDto>.FailureResult(message));
        }

        return Ok(ApiResponse<StudentItemDto>.SuccessResult(data, message));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue("sub") ?? "System";
        var success = await _studentService.DeleteAsync(id, username);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy học viên để xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa mềm học viên thành công."));
    }
}
