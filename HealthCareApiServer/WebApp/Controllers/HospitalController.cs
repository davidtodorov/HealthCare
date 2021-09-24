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
    public class HospitalController : RestController<Hospital, HospitalModel>
    {
        public HospitalController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {

        }

        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        [HttpPost]
        public override ActionResult Post(HospitalModel requestModel)
        {
            return base.Post(requestModel);
        }

        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        [HttpPut]
        public override void Put(int id, HospitalModel requestModel)
        {
            base.Put(id, requestModel);
        }

        [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
        public override void Delete(int id)
        {
            base.Delete(id);
        }
    }
}
