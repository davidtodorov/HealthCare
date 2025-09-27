using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace HealthCare.Controllers
{
    public abstract class HealthCareControllerBase : AbpController
    {
        protected HealthCareControllerBase()
        {
            LocalizationSourceName = HealthCareConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
