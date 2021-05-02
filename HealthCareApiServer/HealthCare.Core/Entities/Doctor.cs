﻿using System.ComponentModel.DataAnnotations;

namespace HealthCare.Core.Entities
{
    public class Doctor
    {
        public int Id { get; set; }
        [Required] 
        public int UserId { get; set; }
        public User User { get; set; }
        [Required]
        public int HospitalId { get; set; }
        public Hospital Hospital { get; set; }
    }
}