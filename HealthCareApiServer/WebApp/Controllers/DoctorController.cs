using AutoMapper;
using HealthCare.Application.Interfaces.Doctor;
using HealthCare.Application.Models.Doctor;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    public class DoctorController : RestController<Doctor, DoctorModel>
    {
        private IDoctorCreator doctorCreator;

        public DoctorController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
            this.doctorCreator = doctorCreator;
        }

        [HttpPost]
        [Route("/api/CreateDoctor")]
        public async Task<ActionResult> CreateDoctor(CreateDoctorModel requestModel)
        {
            var result = await this.doctorCreator.CreateDoctor(requestModel);
            if (result.Failure)
            {
                return BadRequest(result.Error);
            }
            return Ok();
        }
    }
}
