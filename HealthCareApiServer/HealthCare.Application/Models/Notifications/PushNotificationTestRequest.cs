using System.ComponentModel.DataAnnotations;

namespace HealthCare.Application.Models.Notifications
{
    public class PushNotificationTestRequest
    {
        public int? UserId { get; set; }

        [MaxLength(120)]
        public string Title { get; set; }

        [MaxLength(512)]
        public string Body { get; set; }

        [MaxLength(256)]
        public string Url { get; set; }
    }
}
