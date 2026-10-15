using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Shared.Common.Responses;
using System.Text.Json;

namespace Shared.Common.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra tại [{Method}] {Path}: {Message}", 
                context.Request.Method, context.Request.Path, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, code, message, errors) = exception switch
        {
            KeyNotFoundException notFound => (
                StatusCodes.Status404NotFound,
                Shared.Common.Constants.ErrorCodes.SysNotFound,
                notFound.Message,
                new List<string> { notFound.Message }
            ),
            UnauthorizedAccessException unauthorized => (
                StatusCodes.Status401Unauthorized,
                Shared.Common.Constants.ErrorCodes.SysUnauthorized,
                "Bạn không có quyền truy cập hoặc phiên làm việc đã hết hạn.",
                new List<string> { unauthorized.Message }
            ),
            InvalidOperationException badOp => (
                StatusCodes.Status400BadRequest,
                Shared.Common.Constants.ErrorCodes.SysBadRequest,
                badOp.Message,
                new List<string> { badOp.Message }
            ),
            ArgumentException argEx => (
                StatusCodes.Status400BadRequest,
                Shared.Common.Constants.ErrorCodes.SysBadRequest,
                argEx.Message,
                new List<string> { argEx.Message }
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                Shared.Common.Constants.ErrorCodes.SysInternalError,
                "Đã xảy ra lỗi nội bộ trên hệ thống. Vui lòng liên hệ ban quản trị.",
                new List<string> { exception.Message }
            )
        };

        context.Response.StatusCode = statusCode;
        var response = ApiResponse<object>.FailureResult(message, code, errors);
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}

public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
