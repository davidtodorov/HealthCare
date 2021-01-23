using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.Controllers
{
    public class HomeController : ApiController
    {
        [Authorize]
        public IActionResult Index()
        {
            return Ok("home works!");
        }
    }
}
