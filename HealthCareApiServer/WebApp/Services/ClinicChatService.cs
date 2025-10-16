using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json.Nodes;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using WebApp.Models.Chat;

namespace WebApp.Services
{
    public class ClinicChatService
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly OpenAiClient openAiClient;

        public ClinicChatService(IUnitOfWork unitOfWork, OpenAiClient openAiClient)
        {
            this.unitOfWork = unitOfWork;
            this.openAiClient = openAiClient;
        }

        public async Task<SymptomMessageResponse> AnalyzeSymptomsAsync(string userMessage, CancellationToken cancellationToken)
        {
            var departments = await unitOfWork.DepartmentRepository.GetAllAsync(orderBy: query => query.OrderBy(d => d.Name));
            var departmentOptions = departments
                .Select(d => new DepartmentOption
                {
                    Id = d.Id,
                    Name = d.Name
                })
                .ToList();

            var schema = CreateSymptomSchema();

            var payload = new
            {
                patientMessage = userMessage,
                departments = departmentOptions,
                instructions = "Match the patient's symptoms to the most appropriate department id from the list."
            };

            var systemPrompt = "You are an empathetic digital triage nurse. Use the provided departments to route the patient. " +
                               "Respond concisely (max 120 words) and mention the department name if you make a recommendation. " +
                               "If unsure, leave recommendedDepartmentId as null but still give supportive advice.";

            var aiResult = await openAiClient.GenerateJsonAsync<DepartmentAnalysisResult>(systemPrompt, payload, "department_triage", schema, cancellationToken);

            DepartmentSuggestion? suggestion = null;
            if (aiResult.RecommendedDepartmentId.HasValue)
            {
                var matched = departmentOptions.FirstOrDefault(d => d.Id == aiResult.RecommendedDepartmentId.Value);
                if (matched != null)
                {
                    suggestion = new DepartmentSuggestion
                    {
                        Department = matched,
                        Confidence = aiResult.Confidence,
                        Reason = string.IsNullOrWhiteSpace(aiResult.Reasoning) ? null : aiResult.Reasoning.Trim()
                    };
                }
            }

            return new SymptomMessageResponse
            {
                Message = string.IsNullOrWhiteSpace(aiResult.Message)
                    ? BuildFallbackSymptomMessage(suggestion)
                    : aiResult.Message.Trim(),
                SuggestedDepartment = suggestion,
                Departments = departmentOptions,
                FollowUpQuestions = aiResult.FollowUpQuestions ?? new List<string>(),
                SymptomSummary = string.IsNullOrWhiteSpace(aiResult.SymptomSummary)
                    ? userMessage
                    : aiResult.SymptomSummary.Trim()
            };
        }

        public async Task<DoctorRecommendationResponse> RecommendDoctorsAsync(int departmentId, string? symptomSummary, CancellationToken cancellationToken)
        {
            var department = unitOfWork.DepartmentRepository.GetById(departmentId)
                ?? throw new InvalidOperationException($"Department with id {departmentId} was not found.");

            var doctors = await unitOfWork.DoctorRepository.GetAllAsync(
                filter: d => d.DepartmentId == departmentId,
                includeProperties: "User,Hospital,Appointments");

            var suggestions = doctors
                .Select(BuildDoctorSuggestion)
                .OrderByDescending(d => d.FreeSlotCount)
                .ThenBy(d => d.FullName)
                .Take(5)
                .ToList();

            var schema = CreateDoctorSchema();

            var payload = new
            {
                department = new { department.Id, department.Name },
                doctors = suggestions.Select(d => new
                {
                    d.DoctorId,
                    d.FullName,
                    d.HospitalName,
                    d.FreeSlotCount,
                    slots = d.UpcomingSlots.Select(s => new { s.UtcStart, s.DisplayLabel })
                }),
                symptomSummary
            };

            var systemPrompt = "You are a clinical scheduling assistant. Summarize the top doctors with availability for the patient. " +
                               "Encourage them to pick one of the suggested doctors. If there are no available doctors, clearly say so.";

            var aiResult = await openAiClient.GenerateJsonAsync<DoctorRecommendationMessage>(systemPrompt, payload, "doctor_recommendation", schema, cancellationToken);

            return new DoctorRecommendationResponse
            {
                Message = string.IsNullOrWhiteSpace(aiResult.Message)
                    ? BuildFallbackDoctorMessage(department.Name, suggestions)
                    : aiResult.Message.Trim(),
                Department = new DepartmentOption { Id = department.Id, Name = department.Name },
                Doctors = suggestions,
                SymptomSummary = symptomSummary
            };
        }

        private static DepartmentOption BuildDoctorDepartment(Doctor doctor)
        {
            return new DepartmentOption
            {
                Id = doctor.DepartmentId,
                Name = doctor.Department?.Name ?? string.Empty
            };
        }

        private DoctorSuggestion BuildDoctorSuggestion(Doctor doctor)
        {
            var upcomingSlots = FindAvailableSlots(doctor);

            return new DoctorSuggestion
            {
                DoctorId = doctor.Id,
                DepartmentId = doctor.DepartmentId,
                DepartmentName = doctor.Department?.Name,
                FullName = BuildDoctorName(doctor),
                HospitalName = doctor.Hospital?.Name,
                FreeSlotCount = upcomingSlots.Count,
                UpcomingSlots = upcomingSlots
            };
        }

        private static string BuildDoctorName(Doctor doctor)
        {
            var firstName = doctor.User?.FirstName ?? string.Empty;
            var lastName = doctor.User?.LastName ?? string.Empty;
            return string.Join(" ", new[] { firstName, lastName }.Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
        }

        private static List<AppointmentSlotOption> FindAvailableSlots(Doctor doctor)
        {
            const int intervalMinutes = 30;
            var workdayStart = new TimeSpan(8, 0, 0);
            var workdayEnd = new TimeSpan(18, 0, 0);
            var today = DateTime.UtcNow;
            var startDate = DateTime.SpecifyKind(today.Date, DateTimeKind.Utc);
            var endDate = startDate.AddDays(14);

            var takenAppointments = (doctor.Appointments ?? new List<Appointment>())
                .Where(a => a.Status != AppointmentStatus.Canceled)
                .Select(a => DateTime.SpecifyKind(a.DateTime, DateTimeKind.Utc))
                .ToHashSet();

            var slots = new List<DateTime>();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                for (var time = workdayStart; time <= workdayEnd; time = time.Add(TimeSpan.FromMinutes(intervalMinutes)))
                {
                    var slot = date.Add(time);
                    if (slot <= today)
                    {
                        continue;
                    }

                    if (takenAppointments.Contains(slot))
                    {
                        continue;
                    }

                    slots.Add(slot);
                }
            }

            var orderedSlots = slots
                .OrderBy(s => s)
                .Select(CreateSlotOption)
                .Take(12)
                .ToList();

            return orderedSlots;
        }

        private static AppointmentSlotOption CreateSlotOption(DateTime slotUtc)
        {
            var utc = DateTime.SpecifyKind(slotUtc, DateTimeKind.Utc);
            var local = TimeZoneInfo.ConvertTimeFromUtc(utc, TimeZoneInfo.Local);
            var display = local.ToString("ddd, MMM dd • HH:mm", CultureInfo.CurrentCulture);

            return new AppointmentSlotOption
            {
                UtcStart = utc.ToString("o", CultureInfo.InvariantCulture),
                LocalDate = local.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                LocalTime = local.ToString("HH:mm", CultureInfo.InvariantCulture),
                DisplayLabel = display
            };
        }

        private static string BuildFallbackSymptomMessage(DepartmentSuggestion? suggestion)
        {
            if (suggestion?.Department != null)
            {
                return $"Based on what you shared, the {suggestion.Department.Name} team is usually the right place to start. " +
                       "Let me know if you would like to go with that or pick another department.";
            }

            return "Thank you for the details. Let's choose the department that feels closest to your symptoms.";
        }

        private static string BuildFallbackDoctorMessage(string departmentName, IReadOnlyCollection<DoctorSuggestion> doctors)
        {
            if (doctors.Count == 0)
            {
                return $"I couldn't find available doctors in {departmentName} during the next couple of weeks. " +
                       "You can try another department or share more details.";
            }

            var topNames = doctors.Take(3).Select(d => d.FullName).Where(n => !string.IsNullOrWhiteSpace(n)).ToList();
            var intro = topNames.Count > 0
                ? $"Here are the first available doctors in {departmentName}: {string.Join(", ", topNames)}."
                : $"Here are the doctors with availability in {departmentName}.";

            return intro + " Choose the one that feels like the best fit.";
        }

        private static JsonObject CreateSymptomSchema()
        {
            return new JsonObject
            {
                ["name"] = "department_triage",
                ["schema"] = new JsonObject
                {
                    ["$schema"] = "http://json-schema.org/draft-07/schema#",
                    ["type"] = "object",
                    ["additionalProperties"] = false,
                    ["properties"] = new JsonObject
                    {
                        ["message"] = new JsonObject
                        {
                            ["type"] = "string",
                            ["description"] = "Assistant message shown to the patient."
                        },
                        ["recommendedDepartmentId"] = new JsonObject
                        {
                            ["type"] = new JsonArray(JsonValue.Create("integer"), JsonValue.Create("null")),
                            ["description"] = "Id of the recommended department when confident."
                        },
                        ["confidence"] = new JsonObject
                        {
                            ["type"] = new JsonArray(JsonValue.Create("number"), JsonValue.Create("null")),
                            ["minimum"] = 0,
                            ["maximum"] = 1
                        },
                        ["reasoning"] = new JsonObject
                        {
                            ["type"] = "string"
                        },
                        ["followUpQuestions"] = new JsonObject
                        {
                            ["type"] = "array",
                            ["items"] = new JsonObject { ["type"] = "string" }
                        },
                        ["symptomSummary"] = new JsonObject
                        {
                            ["type"] = "string"
                        }
                    },
                    ["required"] = new JsonArray(JsonValue.Create("message"), JsonValue.Create("reasoning"))
                }
            };
        }

        private static JsonObject CreateDoctorSchema()
        {
            return new JsonObject
            {
                ["name"] = "doctor_recommendation",
                ["schema"] = new JsonObject
                {
                    ["$schema"] = "http://json-schema.org/draft-07/schema#",
                    ["type"] = "object",
                    ["additionalProperties"] = false,
                    ["properties"] = new JsonObject
                    {
                        ["message"] = new JsonObject
                        {
                            ["type"] = "string",
                            ["description"] = "Narrative describing the recommended doctors."
                        }
                    },
                    ["required"] = new JsonArray(JsonValue.Create("message"))
                }
            };
        }

        private class DepartmentAnalysisResult
        {
            public string? Message { get; set; }

            public int? RecommendedDepartmentId { get; set; }

            public double? Confidence { get; set; }

            public string? Reasoning { get; set; }

            public List<string>? FollowUpQuestions { get; set; }

            public string? SymptomSummary { get; set; }
        }

        private class DoctorRecommendationMessage
        {
            public string? Message { get; set; }
        }
    }
}
