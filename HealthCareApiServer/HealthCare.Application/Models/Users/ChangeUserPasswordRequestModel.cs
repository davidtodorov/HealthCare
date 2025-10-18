using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Users
{
    public class ChangeUserPasswordRequestModel
    {
        [Required]
        [MinLength(3)]
        public string Password { get; set; }
    }
}
