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
    public class CreateAppointmentModel
    {
        [Required]
        public DateTime DateTime { get; set; }
        public string Reason { get; set; }
        public int PatientId { get; set; }
        [Required]
        public int DoctorId { get; set; }

    }
}
