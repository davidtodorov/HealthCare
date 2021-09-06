using System;
using System.Collections.Generic;
using System.Text;

namespace HealthCare.Application.Models
{
    public class HospitalModel
    {
        public HospitalModel()
        {
            DoctorModels = new List<DoctorModel>();
        }
        public string Name { get; set; }
        public List<DoctorModel> DoctorModels{ get; set; }
    }
}
