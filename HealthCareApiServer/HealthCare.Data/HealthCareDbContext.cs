using HealthCare.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.Data
{
    public class HealthCareDbContext : IdentityDbContext
    {
        public HealthCareDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Hospital> Hospital { get; set; }
    }
}
