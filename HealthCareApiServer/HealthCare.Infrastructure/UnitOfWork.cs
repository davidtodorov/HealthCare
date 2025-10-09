using System;
using System.Threading.Tasks;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure.Repositories;

namespace HealthCare.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        public IRepository<Hospital> HospitalRepository { get; set; }
        public IRepository<Doctor> DoctorRepository { get; set; }
        public IRepository<User> UserRepository { get; set; }

        public IRepository<Department> DepartmentRepository { get; set; }

        public HealthCareDbContext Context => context;

        public UnitOfWork(HealthCareDbContext context)
        {
            this.context = context;
            this.HospitalRepository = new Repository<Hospital>(context);
            this.DoctorRepository = new Repository<Doctor>(context);
            this.UserRepository = new Repository<User>(context);
            this.DepartmentRepository = new Repository<Department>(context);
        }

        public void SaveChanges()
        {
            context.SaveChanges();
        }
        public void Dispose()
        {
            context.Dispose();
        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }

        private readonly HealthCareDbContext context;
    }
}
