using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.Controllers
{
    [EnableCors("CorsApi")]
    [Route("[controller]")]
    [ApiController]
    public abstract class ApiController : ControllerBase
    {

    }
}
