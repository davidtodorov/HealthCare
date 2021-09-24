using HealthCare.Application.Models.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.Doctor
{
    public interface IDoctorCreator
    {
        Task<Result> CreateDoctor(CreateDoctorModel model);
    }
}
