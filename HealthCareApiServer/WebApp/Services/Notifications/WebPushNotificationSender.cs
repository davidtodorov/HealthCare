using HealthCare.Core.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WebPush;

namespace WebApp.Services.Notifications
{
    public class WebPushNotificationSender : IPushNotificationSender
    {
        private readonly WebPushClient client;
        private readonly WebPushOptions options;
        private readonly ILogger<WebPushNotificationSender> logger;

        public WebPushNotificationSender(IOptions<WebPushOptions> options, ILogger<WebPushNotificationSender> logger)
        {
            this.client = new WebPushClient();
            this.options = options.Value;
            this.logger = logger;
        }

        public async Task<PushNotificationSendResult> SendPrescriptionReminderAsync(
            HealthCare.Core.Entities.PushSubscription subscription,
            Prescription prescription,
            DateTime scheduledFor,
            CancellationToken cancellationToken)
        {
            var payload = JsonSerializer.Serialize(new
            {
                notification = new
                {
                    title = $"Time to take {prescription.Name}",
                    body = $"Your {prescription.Dose ?? "medication"} is scheduled at {scheduledFor:HH:mm}.",
                    icon = "/icons/icon-192x192.png",
                    badge = "/icons/icon-72x72.png",
                    data = new
                    {
                        url = "/prescriptions"
                    }
                }
            });

            var pushSubscription = new WebPush.PushSubscription(subscription.Endpoint, subscription.P256dh, subscription.Auth);
            var vapidDetails = new VapidDetails(options.Subject, options.PublicKey, options.PrivateKey);

            try
            {
                await client.SendNotificationAsync(pushSubscription, payload, vapidDetails, cancellationToken);
                return new PushNotificationSendResult { Success = true };
            }
            catch (WebPushException ex)
            {
                logger.LogWarning(ex, "Failed to send push notification to {Endpoint}. StatusCode: {StatusCode}", subscription.Endpoint, ex.StatusCode);
                var shouldRemove = ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound;
                return new PushNotificationSendResult
                {
                    Success = false,
                    RemoveSubscription = shouldRemove
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error while sending push notification to {Endpoint}", subscription.Endpoint);
                return new PushNotificationSendResult { Success = false };
            }
        }
    }
}
