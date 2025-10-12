using HealthCare.Application.Models.Users;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.User
{
    public interface IUserCreator
    {
        Task<CreateUserResult> CreateUserAsync(RegisterUserRequestModel model);
    }
}
