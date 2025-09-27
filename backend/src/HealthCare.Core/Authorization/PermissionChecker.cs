using Abp.Authorization;
using HealthCare.Authorization.Roles;
using HealthCare.Authorization.Users;

namespace HealthCare.Authorization;

public class PermissionChecker : PermissionChecker<Role, User>
{
    public PermissionChecker(UserManager userManager)
        : base(userManager)
    {
    }
}
