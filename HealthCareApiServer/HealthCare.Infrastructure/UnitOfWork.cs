using HealthCare.Core.Entities;
using HealthCare.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;
using System.Threading;
using System.Threading.Tasks;

namespace HealthCare.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        public IRepository<Hospital> HospitalRepository { get; set; }
        public IRepository<Doctor> DoctorRepository { get; set; }
        public IRepository<User> UserRepository { get; set; }

        public IRepository<Department> DepartmentRepository { get; set; }
        public IRepository<Appointment> AppointmentRepository { get; set; }

        public UnitOfWork(HealthCareDbContext context)
        {
            this.context = context;
            this.HospitalRepository = new Repository<Hospital>(context);
            this.DoctorRepository = new Repository<Doctor>(context);
            this.UserRepository = new Repository<User>(context);
            this.DepartmentRepository = new Repository<Department>(context);
            this.AppointmentRepository = new Repository<Appointment>(context);
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

        public Task<IDbContextTransaction> BeginTransactionAsync(System.Transactions.IsolationLevel isolationLevel = System.Transactions.IsolationLevel.Unspecified, CancellationToken cancellationToken = default)
        {
            return this.context.Database.BeginTransactionAsync(cancellationToken);
        }

        private readonly HealthCareDbContext context;
    }
}
