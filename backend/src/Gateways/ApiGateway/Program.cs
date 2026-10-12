var builder = WebApplication.CreateBuilder(args);

// Add YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Trang chủ hiển thị trạng thái API Gateway khi mở trên trình duyệt
app.MapGet("/", () => Results.Content("""
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>QLDaoTao - API Gateway</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
        .card { background: #1e293b; border-radius: 16px; padding: 36px; max-width: 600px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid #334155; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; display: inline-block; margin-bottom: 12px; }
        h1 { margin: 0 0 8px 0; font-size: 24px; color: #ffffff; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
        .route-item { background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3b82f6; display: flex; justify-content: space-between; align-items: center; }
        .route-info { display: flex; flex-direction: column; gap: 4px; }
        .route-path { font-family: monospace; font-size: 14px; color: #38bdf8; font-weight: bold; }
        .route-desc { font-size: 13px; color: #94a3b8; }
        .btn { background: #2563eb; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; transition: 0.2s; }
        .btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">● Online: Port 7000</span>
        <h1>QLDaoTao API Gateway (YARP)</h1>
        <p>Cổng điều hướng trung tâm đang hoạt động bình thường. Bạn có thể truy cập Swagger UI của từng service dưới đây:</p>
        
        <div class="route-item">
            <div class="route-info">
                <span class="route-path">/api/auth/**</span>
                <span class="route-desc">Identity.API (Port 5001) - Tài khoản, JWT</span>
            </div>
            <a class="btn" href="http://localhost:5001/swagger" target="_blank">Mở Swagger</a>
        </div>

        <div class="route-item">
            <div class="route-info">
                <span class="route-path">/api/catalog/**</span>
                <span class="route-desc">Catalog.API (Port 5002) - Danh mục, Phòng học</span>
            </div>
            <a class="btn" href="http://localhost:5002/swagger" target="_blank">Mở Swagger</a>
        </div>
    </div>
</body>
</html>
""", "text/html; charset=utf-8"));

app.MapReverseProxy();

app.Run();
