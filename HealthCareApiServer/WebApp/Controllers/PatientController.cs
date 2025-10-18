using AutoMapper;
using HealthCare.Application.Models.Patients;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;

namespace WebApp.Controllers
{
    public class PatientController : RestController<Patient, PatientModel, PatientModel>
    {
        public PatientController(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
        }
    }
}
