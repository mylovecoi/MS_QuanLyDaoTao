using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// 1. Thêm Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Quản Lý Đào Tạo - Storage API",
        Version = "v1",
        Description = "Microservice chuyên trách lưu trữ, quản lý tệp tin và ảnh đa phương tiện (Media & File Storage)."
    });
});

// 2. Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 3. Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Storage.API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowAll");

// 4. Phục vụ Static Files cho thư mục Uploads dùng chung
var configuredPath = app.Configuration["StorageSettings:UploadBasePath"] ?? "../../../../uploads";
var uploadBasePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, configuredPath));

if (!Directory.Exists(uploadBasePath))
{
    Directory.CreateDirectory(uploadBasePath);
}

// Tự động khởi tạo các thư mục nghiệp vụ con
var subFolders = new[] { "avatars", "documents", "exam-papers", "diplomas", "temp" };
foreach (var sub in subFolders)
{
    var p = Path.Combine(uploadBasePath, sub);
    if (!Directory.Exists(p))
    {
        Directory.CreateDirectory(p);
    }
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadBasePath),
    RequestPath = "/uploads"
});

app.UseAuthorization();
app.MapControllers();

app.Run();
