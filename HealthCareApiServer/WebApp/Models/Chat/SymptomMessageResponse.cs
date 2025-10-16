using System.Collections.Generic;

namespace WebApp.Models.Chat
{
    public class SymptomMessageResponse
    {
        public string Message { get; set; } = string.Empty;

        public DepartmentSuggestion? SuggestedDepartment { get; set; }

        public List<DepartmentOption> Departments { get; set; } = new();

        public List<string> FollowUpQuestions { get; set; } = new();

        public string? SymptomSummary { get; set; }
    }

    public class DepartmentOption
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }

    public class DepartmentSuggestion
    {
        public DepartmentOption Department { get; set; } = new();

        public double? Confidence { get; set; }

        public string? Reason { get; set; }
    }
}
