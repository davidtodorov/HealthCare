using AutoMapper;
using HealthCare.Application.Models.Prescriptions;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    public class PrescriptionIntakeController : RestController<PrescriptionIntake, PrescriptionIntakeModel, PrescriptionIntakeModel>
    {
        public PrescriptionIntakeController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {
        }

        [HttpGet("ByPrescription/{prescriptionId}")]
        public async Task<IEnumerable<PrescriptionIntakeModel>> GetByPrescription(int prescriptionId)
        {
            SetFilterFunc(i => i.PrescriptionId == prescriptionId);
            var items = await Get();
            SetFilterFunc(null);
            return items.OrderBy(i => i.ScheduledFor);
        }

        [HttpPost("Mark")]
        public async Task<ActionResult> Mark([FromBody] PrescriptionIntakeModel model)
        {
            if (model == null)
            {
                return BadRequest();
            }

            model.TakenAt ??= DateTime.UtcNow;

            var existing = (await unitOfWork.PrescriptionIntakeRepository
                .GetAllAsync(i => i.PrescriptionId == model.PrescriptionId && i.ScheduledFor == model.ScheduledFor))
                .FirstOrDefault();

            if (existing != null)
            {
                return Conflict("Intake already recorded for this schedule.");
            }

            return base.Post(model);
        }
    }
}
