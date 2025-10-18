using HealthCare.Application.Models.Users;

namespace HealthCare.Application.Models.Doctor
{
    public class CreateDoctorModel : RegisterUserRequestModel
    {
        //[Required]
        public int HospitalId { get; set; }
        //[Required]
        public int DepartmentId { get; set; }
    }
}
