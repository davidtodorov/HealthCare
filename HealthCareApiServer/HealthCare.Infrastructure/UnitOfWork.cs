using System;
using HealthCare.Core.Entities;

namespace HealthCare.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        public IRepository<Hospital> HospitalRepository { get; set; }
        public IRepository<Doctor> DoctorRepository { get; set; }
        public IRepository<User> UserRepository { get; set; }

        public UnitOfWork(HealthCareDbContext context)
        {
            this.context = context;
            this.HospitalRepository = new Repository<Hospital>(context);
            this.DoctorRepository = new Repository<Doctor>(context);
            this.UserRepository = new Repository<User>(context);
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
