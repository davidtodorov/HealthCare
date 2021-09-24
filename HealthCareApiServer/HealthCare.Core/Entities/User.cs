using HealthCare.Core.Base;
using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace HealthCare.Core.Entities
{
    public class User : IdentityUser<int>, IEntity
    {
        [Required]
        public virtual string FirstName { get; set; }
        [Required]
        public virtual string LastName { get; set; }

        [Required]
        public virtual string CreatedBy { get; set; }
        public virtual DateTime CreatedOn { get; set; }
        [Required]
        public virtual string ModifiedBy { get; set; }
        public virtual DateTime ModifiedOn { get; set; }
        
    }
}
