using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Chat
{
    public class SymptomMessageRequest
    {
        [Required]
        [StringLength(1024)]
        public string Message { get; set; } = string.Empty;
    }
}
