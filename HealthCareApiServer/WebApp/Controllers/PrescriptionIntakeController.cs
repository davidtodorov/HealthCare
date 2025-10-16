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
        public async Task<ActionResult<PrescriptionIntakeModel>> Mark([FromBody] PrescriptionIntakeModel model)
        {
            if (model == null)
            {
                return BadRequest();
            }

            model.TakenAt ??= DateTime.UtcNow;

            await using var tx = await unitOfWork.BeginTransactionAsync();

            var prescriptions = await unitOfWork.PrescriptionRepository.GetAllAsync(
                p => p.Id == model.PrescriptionId,
                includeProperties: "Intakes");

            var prescription = prescriptions.FirstOrDefault();
            if (prescription == null)
            {
                return NotFound($"Prescription {model.PrescriptionId} not found.");
            }

            var existing = prescription.Intakes?.FirstOrDefault(x => x.ScheduledFor == model.ScheduledFor);
            if (existing != null)
            {
                return Conflict("Intake already recorded for this schedule.");
            }

            var postResult = base.Post(model);
            if (postResult is ObjectResult { StatusCode: >= 400 } errorResult)
            {
                return StatusCode(errorResult.StatusCode ?? 500, errorResult.Value);
            }

            var timesPerDay = prescription.Times?.Count ?? 0;
            var expectedTotalIntakes = Math.Max(0, prescription.DurationInDays) * timesPerDay;

            var afterCount = (prescription.Intakes?.Count ?? 0) + 1;

            if (expectedTotalIntakes > 0 && afterCount >= expectedTotalIntakes)
            {
                prescription.IsActive = false;
                unitOfWork.PrescriptionRepository.Update(prescription);
                await unitOfWork.SaveChangesAsync();
                model.PrescriptionIsActive = false;
            }

            await tx.CommitAsync();
            return Ok(model);
        }
    }
}
