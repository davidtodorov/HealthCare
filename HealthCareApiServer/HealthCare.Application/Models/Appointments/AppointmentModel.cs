using HealthCare.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.Appointments
{
    public class AppointmentModel : EntityModel
    {
        public DateTimeOffset DateTime { get; set; }
        public string Reason { get; set; }
        public AppointmentStatus Status { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }

    }
}
