using HealthCare.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace HealthCare.Data
{
    public class HealthCareDbContext : DbContext
    {
        public HealthCareDbContext(DbContextOptions<HealthCareDbContext> options) : base(options)
        {
        }

        public DbSet<Hospital> Courses { get; set; }
    }
}
