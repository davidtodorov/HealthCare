using HealthCare.Core.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Core.Entities
{
    public class Prescription : Entity
    {
        [Required]
        public string Name { get; set; }
        public string Dose { get; set; }

        [ForeignKey(nameof(Patient))]
        public int PatientId { get; set; }
        public virtual Patient Patient { get; set; }


        [ForeignKey(nameof(Appointment))]
        public int AppointmentId { get; set; }
        public virtual Appointment Appointment{ get; set; }


        public DateTime StartDate { get; set; }
        public int DurationInDays { get; set; }

        public List<DateTime> Times { get; set; } = new List<DateTime>();

        public bool IsActive { get; set; }

    }
}
