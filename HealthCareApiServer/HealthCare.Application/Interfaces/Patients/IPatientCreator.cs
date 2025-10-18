using HealthCare.Application.Models.Users;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.Patients
{
    public interface IPatientCreator
    {
        Task<CreateUserResult> CreatePatient(RegisterUserRequestModel model);
    }
}
