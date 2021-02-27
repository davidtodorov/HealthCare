using System.Linq;
using System.Security.Claims;

namespace HealthCare.API.Infrastructure.Extensions
{
    public static class IdentityExetension
    {
        public static string GetId(this ClaimsPrincipal user)
        {
            return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
