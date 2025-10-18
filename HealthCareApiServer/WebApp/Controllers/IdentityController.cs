using HealthCare.Application.Interfaces.Patients;
using HealthCare.Application.Models.Users;
using HealthCare.Core;
using HealthCare.Core.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    public class IdentityController : ApiController
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly ApplicationSettings appSettings;
        private readonly IPatientCreator patientCreator;

        public IdentityController(UserManager<User> userManager, SignInManager<User> signInManager, IOptions<ApplicationSettings> appSettings, IPatientCreator patientCreator)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.appSettings = appSettings.Value;
            this.patientCreator = patientCreator;
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
            return Ok(new { UserId = user.Id, Username = user.UserName, FirstName = user.FirstName, LastName = user.LastName });


            //USE FOR JWT AUTHENTICATION

            //var claims = new List<Claim>
            //{
            //    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            //    new Claim(ClaimTypes.Name, user.UserName),
            //    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            //};

            //var roles = await userManager.GetRolesAsync(user);
            //foreach (var role in roles)
            //{
            //    claims.Add(new Claim(ClaimTypes.Role, role));
            //}

            //var expires = DateTime.UtcNow.AddDays(7);
            //// generate token that is valid for 7 days
            //var tokenHandler = new JwtSecurityTokenHandler();
            //var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            //var token = new JwtSecurityToken(
            //    claims: claims,
            //    expires: expires,
            //    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            //);

            //var encryptedToken = tokenHandler.WriteToken(token);

            //var cookieName = "_auth_token";

            //Response.Cookies.Append(cookieName, encryptedToken, new CookieOptions
            //{
            //    HttpOnly = true,              // JS cannot read it (XSS mitigation)
            //    Secure = true,                // HTTPS only
            //    SameSite = SameSiteMode.None, // set Lax if your SPA is same-site; use None for cross-site
            //    Expires = expires,            // align with token expiry
            //    Path = "/",                   // required for __Host- prefix
            //                                  // Domain = not set for __Host-; if you need subdomains, drop the __Host- prefix and set Domain explicitly
            //});

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
            var result = await this.patientCreator.CreatePatient(model);
            
            if (!result.Result.Succeeded)
            {
                return BadRequest(result.Result.Errors);
            }
            await this.signInManager.SignInAsync(result.User, false, CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
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
        [Route(nameof(Roles))]
        public async Task<UserAndRoles> Roles()
        {
            var user = await userManager.GetUserAsync(User);
            var roles = await userManager.GetRolesAsync(user);
            var userAndRoles = new UserAndRoles(user.FirstName, user.LastName, user.Id, roles);
            return userAndRoles;
        }


    }

    public record UserAndRoles(string firstName, string lastName, int id, IEnumerable<string> roles);
}
