using HealthCare.Core.Base;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthCare.Core.Entities
{
    public class PrescriptionNotificationLog : Entity
    {
        [Required]
        [ForeignKey(nameof(Prescription))]
        public int PrescriptionId { get; set; }

        public virtual Prescription Prescription { get; set; }

        [Required]
        public DateTime ScheduledFor { get; set; }

        [Required]
        public DateTime SentAt { get; set; }
    }
}
