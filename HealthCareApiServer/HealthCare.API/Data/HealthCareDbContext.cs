using HealthCare.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.Data
{
    public class HealthCareDbContext : IdentityDbContext<User>
    {
        public HealthCareDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Hospoital> Hospoitals { get; set; }
    }
}
