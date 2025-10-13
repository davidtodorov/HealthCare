using HealthCare.Application.Models.Patients;
using HealthCare.Application.Models.Prescriptions;
using HealthCare.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.Appointments
{
    public class AppointmentModel : EntityModel
    {
        [Required]
        public DateTime DateTime { get; set; }
        public string Reason { get; set; }
        [Required]
        public AppointmentStatus Status { get; set; }

        [Required]
        public int PatientId { get; set; }
        public PatientModel Patient { get; set; }

        [Required]
        public int DoctorId { get; set; }

        public string Notes { get; set; }

        public virtual List<PrescriptionModel> Prescriptions { get; set; } = new List<PrescriptionModel>();

    }
}
