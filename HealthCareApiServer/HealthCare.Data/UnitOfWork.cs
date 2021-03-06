using System;
using HealthCare.Core.Entities;

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
