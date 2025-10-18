using AutoMapper;
using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Models.Appointments;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Extensions;

namespace WebApp.Controllers
{
    public class AppointmentController : RestController<Appointment, AppointmentModel, CreateAppointmentModel>
    {
        private readonly IMapper mapper;

        public AppointmentController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
            this.mapper = mapper;
        }

        [HttpGet(nameof(GetCurrentPatientAppointments))]
        public async Task<IEnumerable<AppointmentModel>> GetCurrentPatientAppointments()
        {
            if (int.TryParse(User.GetId(), out var userId))
            {
                var patient = (await this.unitOfWork.PatientRepository
                    .GetAllAsync(x => x.UserId == userId))
                    .FirstOrDefault();

                if (patient != null)
                {
                    SetFilterFunc(x => x.PatientId == patient.Id);
                }
            }

            try
            {
                return await base.Get();
            }
            finally
            {
                SetFilterFunc(null);
            }
        }

        [HttpPost(nameof(Book))]
        public async Task<ActionResult> Book(CreateAppointmentModel requestModel)
        {
            var userId = Int32.Parse(User.GetId());

            if (User.IsInRole(RoleConstants.DOCTOR_ROLE))
            {
                if (requestModel.PatientId <= 0)
                {
                    return BadRequest("PatientId is required when scheduling on behalf of a patient.");
                }

                var doctor = (await this.unitOfWork.DoctorRepository
                    .GetAllAsync(d => d.UserId == userId))
                    .FirstOrDefault();

                if (doctor == null)
                {
                    return Forbid();
                }

                // Ensure the selected patient exists before proceeding
                var patient = this.unitOfWork.PatientRepository.GetById(requestModel.PatientId);

                if (patient == null)
                {
                    return BadRequest("The specified patient could not be found.");
                }

                requestModel.DoctorId = doctor.Id;
            }
            else
            {
                var patient = (await this.unitOfWork.PatientRepository
                    .GetAllAsync(x => x.UserId == userId))
                    .FirstOrDefault();

                if (patient == null)
                {
                    return BadRequest("Patient profile not found for the current user.");
                }

                requestModel.PatientId = patient.Id;
            }

            var entity = new Appointment();
            this.mapper.Map(requestModel, entity);
            this.unitOfWork.AppointmentRepository.Insert(entity);
            await unitOfWork.SaveChangesAsync();

            return Ok();
        }

        [HttpPut(nameof(UpdateStatus))]
        public ActionResult UpdateStatus(int id, UpdateAppointmentModel requestModel)
        {
            var entity = this.unitOfWork.AppointmentRepository.GetById(id);
            mapper.Map(requestModel, entity);
            unitOfWork.AppointmentRepository.Update(entity);
            unitOfWork.SaveChanges();
            return Ok();
        }
    }
}
