using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HealthCare.API.Infrastructure.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        private static readonly IdentityRole<int>[] roles =
        {
            new IdentityRole<int>(RoleConstants.ADMIN_ROLE),
            new IdentityRole<int>(RoleConstants.DOCTOR_ROLE),
            new IdentityRole<int>(RoleConstants.PATIENT_ROLE)
        };
        public static async void SeedDatabase(this IApplicationBuilder app)
        {
            using var services = app.ApplicationServices.CreateScope();
            var roleManager = services.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var userManager = services.ServiceProvider.GetRequiredService<UserManager<User>>();

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name))
                {
                    await roleManager.CreateAsync(role);
                }
            }
        }
        public static void ApplyMigrations(this IApplicationBuilder app)
        {
            using var services = app.ApplicationServices.CreateScope();
            var dbContext = services.ServiceProvider.GetService<HealthCareDbContext>();
            dbContext.Database.Migrate();
        }
    }
}
