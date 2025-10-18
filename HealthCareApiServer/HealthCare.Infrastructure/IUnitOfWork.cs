using HealthCare.Core.Entities;
using HealthCare.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;

namespace HealthCare.Infrastructure
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Hospital> HospitalRepository { get; set; }
        IRepository<Doctor> DoctorRepository { get; set; }
        IRepository<Appointment> AppointmentRepository { get; set; }
        IRepository<User> UserRepository { get; set; }
        IRepository<Patient> PatientRepository { get; set; }
        IRepository<Prescription> PrescriptionRepository { get; set; }
        IRepository<PrescriptionIntake> PrescriptionIntakeRepository { get; set; }
        IRepository<PushSubscription> PushSubscriptionRepository { get; set; }
        IRepository<PrescriptionNotificationLog> PrescriptionNotificationLogRepository { get; set; }
        void SaveChanges();
        Task SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.Unspecified, CancellationToken cancellationToken = default);

    }
}
