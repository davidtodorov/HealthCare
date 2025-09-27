using Abp.Zero.EntityFrameworkCore;
using HealthCare.Authorization.Roles;
using HealthCare.Authorization.Users;
using HealthCare.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HealthCare.EntityFrameworkCore;

public class HealthCareDbContext : AbpZeroDbContext<Tenant, Role, User, HealthCareDbContext>
{
    /* Define a DbSet for each entity of the application */

    public HealthCareDbContext(DbContextOptions<HealthCareDbContext> options)
        : base(options)
    {
    }
}
