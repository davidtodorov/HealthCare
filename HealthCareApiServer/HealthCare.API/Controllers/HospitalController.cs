using HealthCare.Application.Models;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.Controllers
{
    public class HospitalController : RestController<Hospital, HospitalModel>
    {
        public HospitalController(IUnitOfWork unitOfWork)
            : base(unitOfWork)
        {

        }

        [HttpPost]
        public override ActionResult Post(HospitalModel model)
        {
            var hospital = new Hospital()
            {
                Name = model.Name
            };
            this.unitOfWork.HospitalRepository.Insert(hospital);
            this.unitOfWork.SaveChanges();
            return Ok();
        }
    }
}
