using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers
{
    public class HomeController : ApiController
    {
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult Index()
        {
            return Ok("home works!");
        }
    }
}
