using HealthCare.Application.Models.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.Doctors
{
    public interface IDoctorCreator
    {
        Task<Result> CreateDoctor(CreateDoctorModel model);
    }
}
