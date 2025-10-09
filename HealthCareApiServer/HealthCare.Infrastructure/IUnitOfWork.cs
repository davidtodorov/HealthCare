using HealthCare.Core.Entities;
using HealthCare.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Infrastructure
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Hospital> HospitalRepository { get; set; }
        IRepository<Doctor> DoctorRepository { get; set; }
        IRepository<User> UserRepository { get; set; }
        void SaveChanges();
        Task SaveChangesAsync();
    }
}
