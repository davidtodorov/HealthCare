using HealthCare.Core;
using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HealthCare.Infrastructure
{
    public class HealthCareDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public HealthCareDbContext(DbContextOptions options) : base(options)
        {

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

            builder.Entity<Department>().HasData(new { Id = 1, Name = "Aesthetic plastic and reconstructive surgery" }, 
                                                 new { Id = 2, Name = "Allergology" },
                                                 new { Id = 3, Name = "Cardiology" },
                                                 new { Id = 4, Name = "Cardiovascular surgery" },
                                                 new { Id = 5, Name = "Chest surgery" },
                                                 new { Id = 6, Name = "Dermatology" },
                                                 new { Id = 7, Name = "Ear nose and throat" },
                                                 new { Id = 8, Name = "Endocrinology diabetes and metabolic diseases" },
                                                 new { Id = 9, Name = "Gastroenterology" },
                                                 new { Id = 10, Name = "General surgery" },
                                                 new { Id = 11, Name = "Hematology" },
                                                 new { Id = 12, Name = "Infections diseases" },
                                                 new { Id = 13, Name = "Internal medicine" },
                                                 new { Id = 14, Name = "Nephrology" },
                                                 new { Id = 15, Name = "Neurology" },
                                                 new { Id = 16, Name = "Nutrition and dietetics" },
                                                 new { Id = 17, Name = "Obstetrics and genecology" },
                                                 new { Id = 18, Name = "Oncology" },
                                                 new { Id = 19, Name = "Ophthalmology" },
                                                 new { Id = 20, Name = "Orthopedics" },
                                                 new { Id = 21, Name = "Physiotherapy" },
                                                 new { Id = 22, Name = "Psychiatry" },
                                                 new { Id = 23, Name = "Radiotherapy" },
                                                 new { Id = 24, Name = "Rheumatology" });
        }
    }
}
