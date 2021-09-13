using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.User
{
    public class CreateUserResult
    {
        public IdentityResult Result { get; set; }
        public Core.Entities.User User { get; set; }
    }
}
