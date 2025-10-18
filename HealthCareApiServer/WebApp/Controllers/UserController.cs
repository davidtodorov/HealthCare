using AutoMapper;
using HealthCare.Application.Models.Users;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    public class UserController : RestController<User, UserModel, UserModel>
    {
        private readonly UserManager<User> userManager;

        public UserController(IUnitOfWork unitOfWork, IMapper mapper, UserManager<User> userManager)
            : base(unitOfWork, mapper)
        {
            this.userManager = userManager;
        }

        [HttpPut("{id}")]
        public override ActionResult Put(int id, UserModel requestModel)
        {
            var user = this.unitOfWork.UserRepository.GetById(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = requestModel.FirstName;
            user.LastName = requestModel.LastName;
            user.UserName = requestModel.Username;

            this.unitOfWork.UserRepository.Update(user);
            this.unitOfWork.SaveChanges();

            return Ok();
        }

        [HttpPut("{id}/password")]
        public async Task<ActionResult> ChangePassword(int id, ChangeUserPasswordRequestModel requestModel)
        {
            if (requestModel == null || string.IsNullOrWhiteSpace(requestModel.Password))
            {
                return BadRequest("Password is required.");
            }

            var user = await this.userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            var resetToken = await this.userManager.GeneratePasswordResetTokenAsync(user);
            var result = await this.userManager.ResetPasswordAsync(user, resetToken, requestModel.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(errors);
            }

            await this.userManager.UpdateAsync(user);
            return NoContent();
        }
    }
}
