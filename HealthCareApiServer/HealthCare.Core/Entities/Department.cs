using HealthCare.Core.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Core.Entities
{
    public class Department : Entity
    {
        public virtual string Name { get; set; }
    }
}
