using HealthCare.Core.Base;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Core.Entities
{
    public class Doctor : Entity
    {
        [Required] 
        public int UserId { get; set; }
        public User User { get; set; }
        [Required]
        public int HospitalId { get; set; }
        public Hospital Hospital { get; set; }
        [Required]
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
    }
}
