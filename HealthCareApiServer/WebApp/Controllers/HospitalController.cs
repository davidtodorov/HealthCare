using AutoMapper;
using HealthCare.Application.Models.Hospital;
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
    public class HospitalController : RestController<Hospital, HospitalModel, HospitalModel>
    {
        public HospitalController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {

        }

        [HttpPost]
        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        public override ActionResult Post(HospitalModel requestModel)
        {
            return base.Post(requestModel);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        public override ActionResult Put(int id, HospitalModel requestModel)
        {
            return base.Put(id, requestModel);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        public override ActionResult Delete(int id)
        {
            return base.Delete(id);
        }
    }
}
