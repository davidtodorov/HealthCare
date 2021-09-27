using HealthCare.Application.Models.Doctor;
using System;
using System.Collections.Generic;
using System.Text;

namespace HealthCare.Application.Models.Hospital
{
    public class HospitalModel : EntityModel
    {
        public HospitalModel()
        {
            //DoctorModels = new List<DoctorModel>();
        }
        public string Name { get; set; }
        //public List<DoctorModel> DoctorModels { get; set; }
    }
}
