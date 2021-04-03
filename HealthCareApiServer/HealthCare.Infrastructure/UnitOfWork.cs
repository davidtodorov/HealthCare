using System;
using HealthCare.Core.Entities;

namespace HealthCare.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        public IRepository<Hospital> HospitalRepository { get; set; }
        public UnitOfWork(HealthCareDbContext context)
        {
            this.context = context;
            this.HospitalRepository = new Repository<Hospital>(context);
        }

        public void SaveChanges()
        {
            context.SaveChanges();
        }
        public void Dispose()
        {
            context.Dispose();
        }

        private readonly HealthCareDbContext context;
    }
}
