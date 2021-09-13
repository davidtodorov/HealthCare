using AutoMapper;
using HealthCare.Application.Models.Doctor;
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
    public class DoctorController : RestController<Doctor, DoctorModel>
    {
        public DoctorController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {

        }
    }
}
