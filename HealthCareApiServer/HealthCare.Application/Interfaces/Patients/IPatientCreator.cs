using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.Patients
{
    public interface IPatientCreator
    {
        Task<Result> CreatePatient(RegisterUserRequestModel model);
    }
}
