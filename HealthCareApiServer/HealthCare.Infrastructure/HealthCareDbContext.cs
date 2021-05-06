using HealthCare.Core;
using HealthCare.Core.Base;
using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HealthCare.Infrastructure
{
    public class HealthCareDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        private IHttpContextAccessor httpContextAccessor;

        public HealthCareDbContext(DbContextOptions options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Department> Departments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }


            builder.Entity<Department>().HasData(new { Id = 1, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Aesthetic plastic and reconstructive surgery" },
                                                 new { Id = 2, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Allergology" },
                                                 new { Id = 3, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Cardiology" },
                                                 new { Id = 4, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Cardiovascular surgery" },
                                                 new { Id = 5, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Chest surgery" },
                                                 new { Id = 6, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Dermatology" },
                                                 new { Id = 7, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Ear nose and throat" },
                                                 new { Id = 8, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Endocrinology diabetes and metabolic diseases" },
                                                 new { Id = 9, CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow, Name = "Gastroenterology" },
                                                 new { Id = 10,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "General surgery" },
                                                 new { Id = 11,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Hematology" },
                                                 new { Id = 12,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Infections diseases" },
                                                 new { Id = 13,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Internal medicine" },
                                                 new { Id = 14,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Nephrology" },
                                                 new { Id = 15,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Neurology" },
                                                 new { Id = 16,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Nutrition and dietetics" },
                                                 new { Id = 17,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Obstetrics and genecology" },
                                                 new { Id = 18,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Oncology" },
                                                 new { Id = 19,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Ophthalmology" },
                                                 new { Id = 20,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Orthopedics" },
                                                 new { Id = 21,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Physiotherapy" },
                                                 new { Id = 22,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Psychiatry" },
                                                 new { Id = 23,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Radiotherapy" },
                                                 new { Id = 24,CreatedBy ="script", CreatedOn = DateTime.UtcNow, ModifiedBy = "script", ModifiedOn = DateTime.UtcNow,  Name = "Rheumatology" });

        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            this.ApplyAuditInformation();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }
        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            this.ApplyAuditInformation();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private void ApplyAuditInformation()
        {
            this.ChangeTracker
                .Entries()
                .Where(e => e.Entity is IEntity && (
                    e.State == EntityState.Added
                    || e.State == EntityState.Modified))
                .ToList()
                .ForEach(entry =>
                {
                    
                    var userName = this.httpContextAccessor.HttpContext.User.Identity.Name;
                    var entity = (IEntity)entry.Entity;

                    entity.ModifiedOn = DateTime.UtcNow;
                    entity.ModifiedBy = userName;

                    if (entry.State == EntityState.Added)
                    {
                        entity.CreatedOn = DateTime.UtcNow;
                        entity.CreatedBy = userName;
                    }
                });
        }
    }
}
