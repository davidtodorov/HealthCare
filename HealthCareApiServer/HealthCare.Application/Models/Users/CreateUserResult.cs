using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace HealthCare.Application.Models.Users
{
    public class CreateUserResult
    {
        public IdentityResult Result { get; set; }
        public User User { get; set; }
    }
}
