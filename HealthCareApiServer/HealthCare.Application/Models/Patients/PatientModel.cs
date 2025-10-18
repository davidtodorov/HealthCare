using HealthCare.Application.Models.Prescriptions;
using System.Collections.Generic;

namespace HealthCare.Application.Models.Patients
{
    public class PatientModel : EntityModel
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => FirstName + " " + LastName;
        public string Email { get; set; }
        public List<PrescriptionModel> Prescriptions{ get; set; }
    }
}
