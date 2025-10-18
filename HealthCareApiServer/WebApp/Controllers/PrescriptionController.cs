using AutoMapper;
using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Models.Appointments;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Prescriptions;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WebApp.Extensions;

namespace WebApp.Controllers
{
    public class PrescriptionController : RestController<Prescription, PrescriptionModel, PrescriptionModel>
    {
        public PrescriptionController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
        }

        [HttpGet("Mine")]
        public async Task<IEnumerable<PrescriptionModel>> GetForCurrentPatient()
        {
            if (!int.TryParse(User.GetId(), out var userId))
            {
                return Enumerable.Empty<PrescriptionModel>();
            }

            var patient = (await this.unitOfWork.PatientRepository
                .GetAllAsync(x => x.UserId == userId))
                .FirstOrDefault();

            if (patient == null)
            {
                return Enumerable.Empty<PrescriptionModel>();
            }

            SetFilterFunc(x => x.PatientId == patient.Id);
            var prescriptions = await this.Get();
            SetFilterFunc(null);

            return prescriptions
                .OrderByDescending(p => p.IsActive)
                .ThenByDescending(p => p.StartDate);
        }

        [HttpGet(nameof(GetPrescriptionsByAppointmentId))]
        public async Task<IEnumerable<PrescriptionModel>> GetPrescriptionsByAppointmentId(int appId)
        {
            SetFilterFunc(x => x.AppointmentId == appId);
            return await this.Get();
        }

    }
}
