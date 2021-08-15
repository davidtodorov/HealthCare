using HealthCare.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    public class HomeController : ApiController
    {
        [Authorize(Roles = "Admin")]
        public IActionResult Index()
        {
            return Ok("home works!");
        }
    }
}
