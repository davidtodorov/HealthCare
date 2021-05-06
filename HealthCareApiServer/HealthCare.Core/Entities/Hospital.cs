using HealthCare.Core.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HealthCare.Core.Entities
{
    public class Hospital : Entity
    {
        public Hospital(string Name)
        {
            this.Name = Name;
        }
        [Required]
        public string Name { get; set; }
    }
}
