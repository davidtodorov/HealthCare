using HealthCare.Application.Models.Prescriptions;
using HealthCare.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Models.Patients
{
    public class PatientModel : EntityModel
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => FirstName + " " + LastName;
        public List<PrescriptionModel> Prescriptions{ get; set; }
    }
}
