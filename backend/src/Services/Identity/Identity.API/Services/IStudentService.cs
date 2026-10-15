using Identity.API.DTOs;
using Shared.Common.Pagination;

namespace Identity.API.Services;

public interface IStudentService
{
    Task<PagedResult<StudentItemDto>> GetPagedAsync(StudentFilterDto filter);
    Task<StudentItemDto?> GetByIdAsync(Guid userId);
    Task<(bool Success, string Message, StudentItemDto? Data)> CreateAsync(CreateStudentDto dto, string createdBy);
    Task<(bool Success, string Message, StudentItemDto? Data)> UpdateAsync(Guid userId, UpdateStudentDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid userId, string deletedBy);
}
