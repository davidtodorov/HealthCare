using System.Linq;
using System.Security.Claims;

namespace WebApp.Extensions
{
    public static class IdentityExetension
    {
        public static string GetId(this ClaimsPrincipal user)
        {
            return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
