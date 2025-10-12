using HealthCare.Core.Base;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Core.Entities
{
    public class Doctor : Entity
    {
        [Required] 
        public virtual int UserId { get; set; }
        public virtual User User { get; set; }
        [Required]
        public virtual int HospitalId { get; set; }
        public virtual Hospital Hospital { get; set; }
        [Required]
        public virtual int DepartmentId { get; set; }
        public virtual Department Department { get; set; }

        public virtual List<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
