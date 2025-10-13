using HealthCare.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.Prescriptions
{
    public class PrescriptionModel : EntityModel
    {
        [Required]
        public string Name { get; set; }
        public string Dose { get; set; }
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public DateTime StartDate { get; set; }
        public int DurationInDays { get; set; }
        public List<DateTime> Times { get; set; } = new List<DateTime>();
        public bool IsActive { get; set; }
    }
}
