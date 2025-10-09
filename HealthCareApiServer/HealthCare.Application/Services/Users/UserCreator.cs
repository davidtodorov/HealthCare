using HealthCare.Application.Interfaces.User;
using HealthCare.Application.Models.User;
using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Services.Users
{
    public class UserCreator : IUserCreator
    {
        private UserManager<User> userManager;

        public UserCreator(UserManager<User> userManager)
        {
            this.userManager = userManager;
        }
        public async Task<CreateUserResult> CreateUserAsync(RegisterUserRequestModel model)
        {
            var result = new CreateUserResult();
            var user = new User
            {
                Email = model.Email,
                UserName = model.Username,
                FirstName = model.FirstName,
                LastName = model.LastName
            };
            result.User = user;
            result.Result = await userManager.CreateAsync(user, model.Password);

            return result;
        }

    }
}
