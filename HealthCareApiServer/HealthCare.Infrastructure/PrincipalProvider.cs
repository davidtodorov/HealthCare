using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HealthCare.Infrastructure
{
    public class PrincipalProvider : IPrincipalProvider
    {
        private readonly ClaimsPrincipal user;
        public PrincipalProvider(IHttpContextAccessor httpContextAccessor)
        {
            this.user = httpContextAccessor.HttpContext?.User;
        }

        public string GetCurrentUserName()
        {
            return this.user?.Identity?.Name;
        }
    }
}
