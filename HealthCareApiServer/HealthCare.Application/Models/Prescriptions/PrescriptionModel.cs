using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Prescriptions
{
    public class PrescriptionModel : EntityModel
    {
        [Required]
        public string Name { get; set; }
        public string Dose { get; set; }
        [Required]
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public DateTime StartDate { get; set; }
        public int DurationInDays { get; set; }
        public List<DateTime> Times { get; set; } = new List<DateTime>();
        public bool IsActive { get; set; }

        public List<PrescriptionIntakeModel> Intakes { get; set; } = new List<PrescriptionIntakeModel>();
    }
}
