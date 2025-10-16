using HealthCare.Core.Base;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthCare.Core.Entities
{
    public class PrescriptionIntake : Entity
    {
        [ForeignKey(nameof(Prescription))]
        public int PrescriptionId { get; set; }

        public virtual Prescription Prescription { get; set; }

        public DateTime ScheduledFor { get; set; }

        public DateTime? TakenAt { get; set; }
    }
}
