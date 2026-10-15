using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Responses;
using Storage.API.DTOs;

namespace Storage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<StorageController> _logger;
    private readonly string _uploadBasePath;

    private static readonly HashSet<string> AllowedFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "avatars",
        "documents",
        "exam-papers",
        "diplomas",
        "temp"
    };

    public StorageController(IConfiguration configuration, ILogger<StorageController> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var configuredPath = _configuration["StorageSettings:UploadBasePath"] ?? "../../../../uploads";
        _uploadBasePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, configuredPath));

        // Tự động kiểm tra và khởi tạo toàn bộ các thư mục lưu trữ nếu chưa có
        EnsureDirectoriesExist();
    }

    private void EnsureDirectoriesExist()
    {
        if (!Directory.Exists(_uploadBasePath))
        {
            Directory.CreateDirectory(_uploadBasePath);
        }

        foreach (var folder in AllowedFolders)
        {
            var folderPath = Path.Combine(_uploadBasePath, folder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
        }
    }

    /// <summary>
    /// Upload file (Ảnh đại diện, tài liệu, đề thi,...) theo cấu trúc folder nghiệp vụ.
    /// </summary>
    /// <param name="file">File nhị phân cần tải lên (multipart/form-data)</param>
    /// <param name="folder">Thư mục phân loại: avatars, documents, exam-papers, diplomas, temp (mặc định: avatars)</param>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<UploadResultDto>>> Upload(IFormFile? file, [FromQuery] string folder = "avatars")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<UploadResultDto>.FailureResult("Vui lòng chọn file cần tải lên."));
        }

        var normalizedFolder = folder.Trim().ToLowerInvariant();
        if (!AllowedFolders.Contains(normalizedFolder))
        {
            return BadRequest(ApiResponse<UploadResultDto>.FailureResult($"Thư mục lưu trữ '{folder}' không hợp lệ. Chỉ chấp nhận: {string.Join(", ", AllowedFolders)}"));
        }

        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        // 1. Kiểm tra định dạng và dung lượng cho Avatar
        if (normalizedFolder == "avatars")
        {
            var allowedImageExtensions = _configuration.GetSection("StorageSettings:AllowedImageExtensions").Get<string[]>()
                                         ?? new[] { ".jpg", ".jpeg", ".png", ".webp" };

            if (!allowedImageExtensions.Contains(fileExtension))
            {
                return BadRequest(ApiResponse<UploadResultDto>.FailureResult($"Định dạng file không hỗ trợ cho ảnh đại diện. Chỉ chấp nhận: {string.Join(", ", allowedImageExtensions)}"));
            }

            var maxAvatarMb = _configuration.GetValue<int>("StorageSettings:MaxAvatarSizeMb", 2);
            if (file.Length > maxAvatarMb * 1024 * 1024)
            {
                return BadRequest(ApiResponse<UploadResultDto>.FailureResult($"Dung lượng ảnh vượt quá giới hạn cho phép ({maxAvatarMb} MB)."));
            }
        }
        else
        {
            // Kiểm tra file tài liệu thông thường
            var maxDocMb = _configuration.GetValue<int>("StorageSettings:MaxDocumentSizeMb", 25);
            if (file.Length > maxDocMb * 1024 * 1024)
            {
                return BadRequest(ApiResponse<UploadResultDto>.FailureResult($"Dung lượng file vượt quá giới hạn ({maxDocMb} MB)."));
            }
        }

        try
        {
            var targetFolder = Path.Combine(_uploadBasePath, normalizedFolder);
            if (!Directory.Exists(targetFolder))
            {
                Directory.CreateDirectory(targetFolder);
            }

            // Tạo tên file duy nhất chống trùng lặp và an toàn
            var uniqueFileName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var physicalFilePath = Path.Combine(targetFolder, uniqueFileName);

            await using (var stream = new FileStream(physicalFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/{normalizedFolder}/{uniqueFileName}";

            var result = new UploadResultDto
            {
                FileName = uniqueFileName,
                OriginalFileName = file.FileName,
                FileUrl = relativeUrl,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
                Folder = normalizedFolder
            };

            _logger.LogInformation("Đã lưu file thành công: {RelativeUrl} ({Size} bytes)", relativeUrl, file.Length);

            return Ok(ApiResponse<UploadResultDto>.SuccessResult(result, "Tải file lên hệ thống thành công."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra trong quá trình lưu trữ file.");
            return StatusCode(500, ApiResponse<UploadResultDto>.FailureResult("Đã có lỗi hệ thống xảy ra khi lưu trữ file."));
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái hoạt động của Storage Service và đường dẫn lưu trữ.
    /// </summary>
    [HttpGet("health")]
    public ActionResult<ApiResponse<object>> HealthCheck()
    {
        return Ok(ApiResponse<object>.SuccessResult(new
        {
            Service = "Storage.API",
            Status = "Healthy",
            UploadBasePath = _uploadBasePath,
            Folders = AllowedFolders,
            Timestamp = DateTime.UtcNow
        }, "Storage Service đang hoạt động bình thường."));
    }
}
