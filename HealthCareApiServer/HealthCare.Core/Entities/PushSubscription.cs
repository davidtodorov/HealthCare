using HealthCare.Core.Base;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthCare.Core.Entities
{
    public class PushSubscription : Entity
    {
        [Required]
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        public virtual User User { get; set; }

        [Required]
        [MaxLength(512)]
        public string Endpoint { get; set; }

        [Required]
        [MaxLength(128)]
        public string P256dh { get; set; }

        [Required]
        [MaxLength(128)]
        public string Auth { get; set; }
    }
}
