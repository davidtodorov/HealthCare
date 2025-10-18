using HealthCare.Application.Models;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Notifications
{
    public class PushSubscriptionModel : EntityModel
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string Endpoint { get; set; }

        [Required]
        public string P256dh { get; set; }

        [Required]
        public string Auth { get; set; }
    }
}
