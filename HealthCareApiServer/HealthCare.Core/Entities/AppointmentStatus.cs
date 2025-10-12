using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Core.Entities
{
    public enum AppointmentStatus
    {
        [Description("Upcoming")]
        Upcoming,
        Completed,
        Canceled
    }
}
