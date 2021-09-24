using HealthCare.Application.Models.Doctor;
using System;
using System.Collections.Generic;
using System.Text;

namespace HealthCare.Application.Models.Hospital
{
    public class HospitalModel
    {
        public HospitalModel()
        {
            //DoctorModels = new List<DoctorModel>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        //public List<DoctorModel> DoctorModels { get; set; }
    }
}
