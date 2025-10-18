using System;
using System.Threading;
using System.Threading.Tasks;
using HealthCare.Core.Entities;

namespace WebApp.Services.Notifications
{
    public interface IPushNotificationSender
    {
        Task<PushNotificationSendResult> SendPrescriptionReminderAsync(
            PushSubscription subscription,
            Prescription prescription,
            DateTime scheduledFor,
            CancellationToken cancellationToken);
    }
}
