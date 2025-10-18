using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WebApp.Services.Notifications
{
    public class PrescriptionReminderHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory scopeFactory;
        private readonly ILogger<PrescriptionReminderHostedService> logger;
        private readonly WebPushOptions options;

        public PrescriptionReminderHostedService(
            IServiceScopeFactory scopeFactory,
            IOptions<WebPushOptions> options,
            ILogger<PrescriptionReminderHostedService> logger)
        {
            this.scopeFactory = scopeFactory;
            this.logger = logger;
            this.options = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var interval = TimeSpan.FromSeconds(Math.Max(30, options.ReminderIntervalSeconds));

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error while processing prescription reminders");
                }

                try
                {
                    await Task.Delay(interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // Ignore cancellation exceptions when shutting down
                }
            }
        }

        private async Task ProcessRemindersAsync(CancellationToken cancellationToken)
        {
            using var scope = scopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var sender = scope.ServiceProvider.GetRequiredService<IPushNotificationSender>();
            var now = DateTime.UtcNow;
            var lookAhead = now.AddMinutes(Math.Max(5, options.ReminderLookAheadMinutes));
            var lookBack = now.AddMinutes(-Math.Max(5, options.ReminderLookAheadMinutes));

            var prescriptions = await unitOfWork.PrescriptionRepository.GetAllAsync(
                p => p.IsActive,
                includeProperties: "Patient,Patient.User,Intakes,NotificationLogs");

            if (prescriptions == null || prescriptions.Count == 0)
            {
                return;
            }

            var relevantPrescriptions = prescriptions
                .Where(p => p.Patient?.UserId != null)
                .ToList();

            if (!relevantPrescriptions.Any())
            {
                return;
            }

            var notificationLogs = await unitOfWork.PrescriptionNotificationLogRepository.GetAllAsync(
                log => log.ScheduledFor >= lookBack && log.ScheduledFor <= lookAhead);

            var logsLookup = notificationLogs
                .GroupBy(l => (l.PrescriptionId, l.ScheduledFor))
                .ToDictionary(g => g.Key, g => g.First());

            foreach (var prescription in relevantPrescriptions)
            {
                var patientUserId = prescription.Patient.UserId;
                var subscriptions = await unitOfWork.PushSubscriptionRepository.GetAllAsync(
                    s => s.UserId == patientUserId);

                if (subscriptions == null || subscriptions.Count == 0)
                {
                    continue;
                }

                var upcomingTimes = GetUpcomingSchedule(prescription, now, lookAhead);

                foreach (var scheduledFor in upcomingTimes)
                {
                    if (cancellationToken.IsCancellationRequested)
                    {
                        return;
                    }

                    if (logsLookup.ContainsKey((prescription.Id, scheduledFor)))
                    {
                        continue;
                    }

                    var alreadyTaken = prescription.Intakes?.Any(i => i.ScheduledFor == scheduledFor) ?? false;
                    if (alreadyTaken)
                    {
                        continue;
                    }

                    foreach (var subscription in subscriptions.ToList())
                    {
                        var result = await sender.SendPrescriptionReminderAsync(subscription, prescription, scheduledFor, cancellationToken);
                        if (result.RemoveSubscription)
                        {
                            unitOfWork.PushSubscriptionRepository.Remove(subscription);
                        }
                    }

                    unitOfWork.PrescriptionNotificationLogRepository.Insert(new PrescriptionNotificationLog
                    {
                        PrescriptionId = prescription.Id,
                        ScheduledFor = scheduledFor,
                        SentAt = now
                    });
                }
            }

            await unitOfWork.SaveChangesAsync();
        }

        private static IEnumerable<DateTime> GetUpcomingSchedule(Prescription prescription, DateTime from, DateTime to)
        {
            if (prescription == null)
            {
                yield break;
            }

            var times = (prescription.Times ?? new List<DateTime>())
                .Select(t => DateTime.SpecifyKind(t, DateTimeKind.Utc).TimeOfDay)
                .Distinct()
                .ToList();

            if (!times.Any())
            {
                yield break;
            }

            var duration = Math.Max(1, prescription.DurationInDays);
            var startDate = DateTime.SpecifyKind(prescription.StartDate, DateTimeKind.Utc).Date;
            var endDate = startDate.AddDays(duration);

            for (var day = startDate; day < endDate; day = day.AddDays(1))
            {
                foreach (var time in times)
                {
                    var scheduled = DateTime.SpecifyKind(day.Add(time), DateTimeKind.Utc);
                    if (scheduled < from || scheduled > to)
                    {
                        continue;
                    }

                    yield return scheduled;
                }
            }
        }
    }
}
