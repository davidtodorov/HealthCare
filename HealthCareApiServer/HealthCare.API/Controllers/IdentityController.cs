using System;
using System.Text;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using HealthCare.API.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using HealthCare.Core.Entities;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace HealthCare.API.Controllers
{
    public class IdentityController : ApiController
    {
        private readonly UserManager<User> userManager;
        private readonly ApplicationSettings appSettings;
        private readonly SignInManager<User> signInManager;

        public IdentityController(SignInManager<User> signInManager, UserManager<User> userManager, IOptions<ApplicationSettings> appSettings)
        {
            this.userManager = userManager;
            this.appSettings = appSettings.Value;
            this.signInManager = signInManager;
        }

        [HttpPost]
        [Route(nameof(Login))]
        public async Task<ActionResult<object>> Login(LoginRequestModel model)
        {
            var user = await this.userManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                return Unauthorized();
            }
            var isPasswordValid = await this.userManager.CheckPasswordAsync(user, model.Password);
            if (!isPasswordValid)
            {
                return Unauthorized();
            }

            await signInManager.SignInAsync(user, false);
            var userRoles = await userManager.GetRolesAsync(user);
            return new
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = userRoles
            };

            //USE THIS CODE BELOW IF YOU WANT TO USE JWT TOKENS

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

            //// generate token that is valid for 7 days
            //var tokenHandler = new JwtSecurityTokenHandler();
            //var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            //var token = new JwtSecurityToken(
            //    claims: claims, 
            //    expires: DateTime.UtcNow.AddDays(7), 
            //    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            //);

            //var encryptedToken = tokenHandler.WriteToken(token);

            //Response.Cookies.Append("auth-token", encryptedToken);

            //return new { 
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
                LastName = model.LastsName
            };
            var result = await this.userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok();
            }

            return this.BadRequest(result.Errors);
        }

        [HttpGet]
        [Authorize]
        [Route(nameof(Authenticate))]
        public ActionResult<object> Authenticate(IEnumerable<string> roles)
        {
            var userIdentity = User.Identity;
            var claims = User.Claims;
            var userRoles = claims.Where(claim => claim.Type == ClaimTypes.Role && roles.Contains(claim.Value));

            //var cookies = HttpContext.Request.Cookies;
            //var authToken = cookies["auth-token"];
            //var tokenHandler = new JwtSecurityTokenHandler();
            //var jwtResult = tokenHandler.ReadJwtToken(authToken);
            //var roleClaims = jwtResult.Claims.Where(claim => claim.Type == ClaimTypes.Role);

            return new
            {
                Username = User.Identity.Name,
                Roles = userRoles.Select(x => x.Value)
            };
        }
    }
}
