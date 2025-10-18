using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Doctor
{
    public class DoctorModel : EntityModel
    {
        [Required]
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        [Required]
        public int HospitalId { get; set; }
        public string HospitalName { get; set; }
        [Required]
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
    }
}
