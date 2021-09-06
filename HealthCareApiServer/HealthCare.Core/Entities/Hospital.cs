using HealthCare.Core.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HealthCare.Core.Entities
{
    public class Hospital : Entity
    {
        public Hospital()
        {
            this.Doctors = new List<Doctor>();
        }
        public Hospital(string Name) : this()
        {
            this.Name = Name;
        }
        [Required]
        public virtual string Name { get; set; }
        public virtual List<Doctor> Doctors { get; set; }
    }
}
