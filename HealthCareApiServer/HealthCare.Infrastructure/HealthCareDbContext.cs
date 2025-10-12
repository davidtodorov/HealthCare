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

        //public DbSet<Patient> Patients { get; set; }
        public DbSet<Department> Departments { get; set; }

        public DbSet<Appointment> Appointments { get; set; }

        public DbSet<Prescription> Prescriptions { get; set; }
    
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }


            // Use static DateTime values instead of DateTime.UtcNow
            var staticDate = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc);
            var staticModifiedOn = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.Entity<Department>().HasData(new { Id = 1, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Aesthetic plastic and reconstructive surgery" },
                                                 new { Id = 2, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Allergology" },
                                                 new { Id = 3, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Cardiology" },
                                                 new { Id = 4, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Cardiovascular surgery" },
                                                 new { Id = 5, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Chest surgery" },
                                                 new { Id = 6, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Dermatology" },
                                                 new { Id = 7, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Ear nose and throat" },
                                                 new { Id = 8, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Endocrinology diabetes and metabolic diseases" },
                                                 new { Id = 9, CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Gastroenterology" },
                                                 new { Id = 10,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "General surgery" },
                                                 new { Id = 11,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Hematology" },
                                                 new { Id = 12,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Infections diseases" },
                                                 new { Id = 13,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Internal medicine" },
                                                 new { Id = 14,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Nephrology" },
                                                 new { Id = 15,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Neurology" },
                                                 new { Id = 16,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Nutrition and dietetics" },
                                                 new { Id = 17,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Obstetrics and genecology" },
                                                 new { Id = 18,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Oncology" },
                                                 new { Id = 19,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Ophthalmology" },
                                                 new { Id = 20,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Orthopedics" },
                                                 new { Id = 21,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Physiotherapy" },
                                                 new { Id = 22,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Psychiatry" },
                                                 new { Id = 23,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Radiotherapy" },
                                                 new { Id = 24,CreatedBy ="script", CreatedOn = staticDate, ModifiedBy = "script", ModifiedOn = staticDate, Name = "Rheumatology" });

        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                .UseLazyLoadingProxies();
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
                    string userName;
                    if (this.httpContextAccessor.HttpContext == null)
                    {
                        userName = "System";
                    }
                    else
                    {
                        userName = this.httpContextAccessor.HttpContext.User.Identity.Name ?? "Anonymous";
                    }
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
