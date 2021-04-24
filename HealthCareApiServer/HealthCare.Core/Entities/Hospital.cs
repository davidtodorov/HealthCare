using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HealthCare.Core.Entities
{
    public class Hospital
    {
        public Hospital(string name)
        {
            this.Name = name;
        }
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
    }
}
