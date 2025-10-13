using HealthCare.Core.Base;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthCare.Core.Entities
{
    public class Patient : Entity
    {
        [Required]
        [ForeignKey(nameof(User))]
        public virtual int UserId { get; set; }
        public virtual User User { get; set; }
        public virtual List<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual List<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}
