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

namespace WebApp.Controllers
{
    public class PrescriptionController : RestController<Prescription, PrescriptionModel, PrescriptionModel>
    {
        private readonly IMapper mapper; // Add this field to store the injected mapper

        public PrescriptionController(IUnitOfWork unitOfWork, IMapper mapper, IDoctorCreator doctorCreator) : base(unitOfWork, mapper)
        {
            this.mapper = mapper; // Assign to the new private field
        }

        [HttpGet(nameof(GetPrescriptionsByAppointmentId))]
        public async Task<IEnumerable<PrescriptionModel>> GetPrescriptionsByAppointmentId(int appId)
        {
            SetFilterFunc(x => x.AppointmentId == appId);
            return await this.Get();
        }

    }
}
