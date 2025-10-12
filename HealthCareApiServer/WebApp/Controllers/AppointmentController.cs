using AutoMapper;
using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Models.Appointments;
using HealthCare.Application.Models.Doctor;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using HealthCare.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Extensions;

namespace WebApp.Controllers
{
    public class AppointmentController : RestController<Appointment, AppointmentModel, AppointmentModel>
    {
        private readonly IMapper mapper;

        public AppointmentController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
            this.mapper = mapper;
        }

        [HttpPost(nameof(Book))]
        public async Task<ActionResult> Book(AppointmentModel requestModel)
        {
            requestModel.PatientId = Int32.Parse(User.GetId());
            var entity = new Appointment();
            this.mapper.Map(requestModel, entity);
            this.unitOfWork.AppointmentRepository.Insert(entity);
            await unitOfWork.SaveChangesAsync();

            return Ok();
        }
    }
}
