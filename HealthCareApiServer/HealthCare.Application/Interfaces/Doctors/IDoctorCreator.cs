using HealthCare.Application.Models.Doctor;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.Doctors
{
    public interface IDoctorCreator
    {
        Task<Result> CreateDoctor(CreateDoctorModel model);
    }
}
