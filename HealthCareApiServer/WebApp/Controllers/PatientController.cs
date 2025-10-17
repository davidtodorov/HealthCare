using AutoMapper;
using HealthCare.Application.Models.Patients;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    public class PatientController : RestController<Patient, PatientModel, PatientModel>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public PatientController(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }
    }
}
