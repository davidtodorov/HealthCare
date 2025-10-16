using HealthCare.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Chat;
using WebApp.Services;

namespace WebApp.Controllers
{
    [Authorize(Roles = RoleConstants.PATIENT_ROLE)]
    public class ChatController : ApiController
    {
        private readonly ClinicChatService clinicChatService;

        public ChatController(ClinicChatService clinicChatService)
        {
            this.clinicChatService = clinicChatService;
        }

        [HttpPost("Symptoms")]
        [ProducesResponseType(typeof(SymptomMessageResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<SymptomMessageResponse>> AnalyzeSymptoms([FromBody] SymptomMessageRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var response = await clinicChatService.AnalyzeSymptomsAsync(request.Message, cancellationToken);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("Department")]
        [ProducesResponseType(typeof(DoctorRecommendationResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<DoctorRecommendationResponse>> RecommendDoctors([FromBody] DoctorRecommendationRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var response = await clinicChatService.RecommendDoctorsAsync(request.DepartmentId, request.SymptomSummary, cancellationToken);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
