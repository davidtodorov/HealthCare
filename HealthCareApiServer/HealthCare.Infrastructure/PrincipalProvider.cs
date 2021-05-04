using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

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
