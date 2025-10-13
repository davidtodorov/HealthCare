using AutoMapper;
using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Models.Appointments;
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
using WebApp.Extensions;

namespace WebApp.Controllers
{
    public class DoctorController : RestController<Doctor, DoctorModel, DoctorModel>
    {
        private IDoctorCreator doctorCreator;
        private readonly IMapper mapper; // Add this field to store the injected mapper

        public DoctorController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
            this.doctorCreator = doctorCreator;
            this.mapper = mapper; // Assign to the new private field
        }

        [HttpPost(nameof(Create))]
        public async Task<ActionResult> Create(CreateDoctorModel requestModel)
        {
            requestModel.DepartmentId = 1;
            requestModel.HospitalId = 2;
            var result = await this.doctorCreator.CreateDoctor(requestModel);
            if (result.Failure)
            {
                return BadRequest(result.Error);
            }
            return Ok();
        }

        [HttpGet(nameof(GetAppointmentsForDoctor))]
        public async Task<ActionResult<IEnumerable<AppointmentModel>>> GetAppointmentsForDoctor(int doctorId, int month)
        {
            var userId = Int32.Parse(User.GetId());
            var appointents = (await this.unitOfWork.AppointmentRepository.GetAllAsync(a => a.Doctor.UserId == userId && a.DateTime.Month == month)).ToList();
            var listDto = new List<AppointmentModel>();
            mapper.Map(appointents, listDto);
            return Ok(listDto);
            
        }
    }
}
