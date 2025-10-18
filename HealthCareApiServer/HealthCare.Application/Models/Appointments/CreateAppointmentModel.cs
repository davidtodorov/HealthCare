using System;
using System.ComponentModel.DataAnnotations;

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
