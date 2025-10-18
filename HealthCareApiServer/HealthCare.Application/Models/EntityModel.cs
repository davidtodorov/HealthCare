using System;

namespace HealthCare.Application.Models
{
    public class EntityModel : IEntityModel
    {
        public int Id { get; set; }
        public DateTime CreatedOn { get; set; }

        public string CreatedBy { get; set; }

        public DateTime ModifiedOn { get; set; }

        public string ModifiedBy { get; set; }
    }
}
