using System.Collections.Generic;

namespace WebApp.Models.Chat
{
    public class DoctorRecommendationResponse
    {
        public string Message { get; set; } = string.Empty;

        public DepartmentOption Department { get; set; } = new();

        public List<DoctorSuggestion> Doctors { get; set; } = new();

        public string? SymptomSummary { get; set; }
    }

    public class DoctorSuggestion
    {
        public int DoctorId { get; set; }

        public int DepartmentId { get; set; }

        public string? DepartmentName { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? HospitalName { get; set; }

        public int FreeSlotCount { get; set; }

        public List<AppointmentSlotOption> UpcomingSlots { get; set; } = new();
    }

    public class AppointmentSlotOption
    {
        public string UtcStart { get; set; } = string.Empty;

        public string LocalDate { get; set; } = string.Empty;

        public string LocalTime { get; set; } = string.Empty;

        public string DisplayLabel { get; set; } = string.Empty;
    }
}
