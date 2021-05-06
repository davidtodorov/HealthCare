using HealthCare.Core.Base;
using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Core.Entities
{
    public class User : IdentityUser<int>, IEntity
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }

        [Required]
        public string CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        [Required]
        public string ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }
        
    }
}
