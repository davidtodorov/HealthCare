using HealthCare.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Infrastructure
{
    public class UnitOfWork : IDisposable
    {
        public Repository<Hospital> HospitalRepository { get; set; }
        public UnitOfWork(HealthCareDbContext context)
        {
            this.context = context;
            this.HospitalRepository = new Repository<Hospital>(context);
        }
        public void Dispose()
        {
            context.Dispose();
        }

        private readonly HealthCareDbContext context;
    }
}
