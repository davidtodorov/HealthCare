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
    public class UpdateAppointmentModel
    {
        public AppointmentStatus Status { get; set; }

    }
}
