
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Users
{
    public class LoginRequestModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
