using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HealthCare.Models
{
    public class Hospital
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
    }
}
