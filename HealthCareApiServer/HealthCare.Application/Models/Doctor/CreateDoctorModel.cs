using HealthCare.Application.Models.User;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
