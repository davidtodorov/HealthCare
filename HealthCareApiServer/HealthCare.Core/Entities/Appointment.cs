using HealthCare.Core.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Core.Entities
{
    public class Appointment : Entity
    {
        public DateTime DateTime { get; set; }
        public string Reason { get; set; }

        public AppointmentStatus Status { get; set; }
        public List<string> Notes { get; set; }


        [ForeignKey(nameof(Patient))]
        public int PatientId { get; set; }
        public virtual Patient Patient { get; set; }


        [ForeignKey(nameof(Doctor))]
        public int DoctorId { get; set; }
        public virtual Doctor Doctor { get; set; }


        public virtual List<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}
