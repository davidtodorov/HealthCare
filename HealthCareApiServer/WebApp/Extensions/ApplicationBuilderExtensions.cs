using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace WebApp.Infrastructure.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        private const string DefaultAdminPassword = "admin";

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

            var admin = await userManager.FindByEmailAsync("admin@abv.bg");
            if (admin == null)
            {
                var createdAdmin = new User
                {
                    Email = "admin@abv.bg",
                    UserName = "admin",
                    FirstName = "Admin",
                    LastName = "Admin"
                };
                await userManager.CreateAsync(createdAdmin, DefaultAdminPassword);
                await userManager.AddToRoleAsync(createdAdmin, roles[0].Name);
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
