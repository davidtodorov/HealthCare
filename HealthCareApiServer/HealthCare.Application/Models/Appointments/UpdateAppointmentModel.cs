using HealthCare.Application.Models.Prescriptions;
using HealthCare.Core.Entities;
using System.Collections.Generic;

namespace HealthCare.Application.Models.Appointments
{
    public class UpdateAppointmentModel
    {
        public AppointmentStatus Status { get; set; }
        public string Notes { get; set; }
        public List<PrescriptionModel> Prescriptions{ get; set; }

    }
}
