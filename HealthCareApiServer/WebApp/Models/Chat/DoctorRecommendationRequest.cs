using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Chat
{
    public class DoctorRecommendationRequest
    {
        [Required]
        public int DepartmentId { get; set; }

        public string? SymptomSummary { get; set; }

        public string? UserMessage { get; set; }
    }
}
