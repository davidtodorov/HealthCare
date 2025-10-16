using HealthCare.Application.Models;
using System;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Prescriptions
{
    public class PrescriptionIntakeModel : EntityModel
    {
        [Required]
        public int PrescriptionId { get; set; }

        public DateTime ScheduledFor { get; set; }

        public DateTime? TakenAt { get; set; }
    }
}
