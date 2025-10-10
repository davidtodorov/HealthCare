using System;
using System.Text;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using HealthCare.Core.Entities;
using System.Collections.Generic;
using HealthCare.Core;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Linq;
using HealthCare.Application.Models.User;
using Microsoft.AspNetCore.Authorization;

namespace WebApp.Controllers
{
    public class IdentityController : ApiController
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly ApplicationSettings appSettings;

        public IdentityController(UserManager<User> userManager, SignInManager<User> signInManager, IOptions<ApplicationSettings> appSettings)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.appSettings = appSettings.Value;
        }

        [HttpPost]
        [Route(nameof(Login))]
        public async Task<ActionResult<object>> Login(LoginRequestModel model)
        {
            var user = await userManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                return Unauthorized();
            }
            var isPasswordValid = await userManager.CheckPasswordAsync(user, model.Password);
            if (!isPasswordValid)
            {
                return Unauthorized();
            }


            await signInManager.SignInAsync(user, false, CookieAuthenticationDefaults.AuthenticationScheme);

            return Ok(new { Username = user.UserName, FirstName = user.FirstName, LastName = user.LastName });


            //USE FOR JWT AUTHENTICATION

            //var claims = new List<Claim>
            //{
            //    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            //    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            //};

            //var roles = await userManager.GetRolesAsync(user);
            //foreach (var role in roles)
            //{
            //    claims.Add(new Claim(ClaimTypes.Role, role));
            //}

            //// generate token that is valid for 7 days
            //var tokenHandler = new JwtSecurityTokenHandler();
            //var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            //var token = new JwtSecurityToken(
            //    claims: claims,
            //    expires: DateTime.UtcNow.AddDays(7),
            //    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            //);

            //var encryptedToken = tokenHandler.WriteToken(token);

            //Response.Cookies.Append("token", encryptedToken);

            //return new
            //{
            //    Token = encryptedToken
            //};
        }

        [HttpPost]
        [Route(nameof(Register))]
        public async Task<ActionResult> Register(RegisterUserRequestModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = new User
            {
                Email = model.Email,
                UserName = model.Username,
                FirstName = model.FirstName,
                LastName = model.LastName
            };
            var result = await userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, RoleConstants.PATIENT_ROLE);
                await signInManager.SignInAsync(user, false, CookieAuthenticationDefaults.AuthenticationScheme);
                return Ok(new { Username = user.UserName, FirstName = user.FirstName, LastName = user.LastName });
            }

            return this.BadRequest(result.Errors);
        }

        [HttpPost]
        [Route(nameof(Logout))]
        public async Task<ActionResult> Logout()
        {
            await this.signInManager.SignOutAsync();
            return Ok();
        }

        [HttpPost]
        [Route(nameof(Verify))]
        public async Task<ActionResult> Verify()
        {
            var user = await userManager.GetUserAsync(User);
            return user != null ? Ok(new { Username = user.UserName, FirstName = user.FirstName, LastName = user.LastName }) : Unauthorized();
        }

        [HttpGet]
        [Authorize]
        [Route(nameof(Roles))]
        public async Task<IEnumerable<string>> Roles()
        {
            var user = await userManager.GetUserAsync(User);
            var roles = await userManager.GetRolesAsync(user);
            return roles;
        }
    }
}
