using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.Controllers
{
    public class HospitalController : ApiController
    {
        [Authorize]
        [HttpPost]
        public IActionResult Create()
        {
            return Ok();
        }
    }
}
