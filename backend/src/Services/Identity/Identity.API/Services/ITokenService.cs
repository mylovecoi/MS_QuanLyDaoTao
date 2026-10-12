using Identity.API.Entities;

namespace Identity.API.Services;

public interface ITokenService
{
    string GenerateToken(AppUser user);
    RefreshToken GenerateRefreshToken(Guid userId, int expireDays = 7);
}
