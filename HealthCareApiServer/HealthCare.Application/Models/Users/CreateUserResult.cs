using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.Users
{
    public class CreateUserResult
    {
        public IdentityResult Result { get; set; }
        public User User { get; set; }
    }
}
