namespace Shared.Common.Pagination;

public class PaginationFilter
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 10 : value);
    }

    public string? SearchTerm { get; set; }

    /// <summary>
    /// Alias cho SearchTerm để linh hoạt khi client gửi keyword hoặc searchTerm
    /// </summary>
    public string? Keyword
    {
        get => SearchTerm;
        set => SearchTerm = value;
    }

    public string? SortBy { get; set; }
    public bool IsAscending { get; set; } = true;
}
