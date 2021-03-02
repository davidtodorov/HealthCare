using HealthCare.API.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        [Required] 
        public int UserId { get; set; }
        public User User { get; set; }
        [Required]
        public int HospitalId { get; set; }
        public Hospital Hospital { get; set; }
    }
}
