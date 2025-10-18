using AutoMapper;
using HealthCare.Application.Models.Notifications;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WebApp.Extensions;
using WebApp.Services.Notifications;
using WebPush;
using PushSubscriptionEntity = HealthCare.Core.Entities.PushSubscription;

namespace WebApp.Controllers
{
    public class PushNotificationsController : ApiController
    {
        private const string DefaultTestTitle = "HealthCare notification test";
        private const string DefaultTestBody = "If you received this message, push notifications are configured correctly.";
        private const string DefaultTestUrl = "/prescriptions";

        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;
        private readonly WebPushOptions options;

        public PushNotificationsController(IUnitOfWork unitOfWork, IMapper mapper, IOptions<WebPushOptions> options)
        {
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
            this.options = options.Value;
        }

        [HttpGet("public-key")]
        public ActionResult<object> GetPublicKey()
        {
            if (string.IsNullOrWhiteSpace(options.PublicKey))
            {
                return NotFound();
            }

            return Ok(new { publicKey = options.PublicKey });
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionModel model)
        {
            if (model == null || model.UserId <= 0 || string.IsNullOrWhiteSpace(model.Endpoint)
                || string.IsNullOrWhiteSpace(model.P256dh) || string.IsNullOrWhiteSpace(model.Auth))
            {
                return BadRequest();
            }

            var existing = (await unitOfWork.PushSubscriptionRepository.GetAllAsync(
                s => s.UserId == model.UserId && s.Endpoint == model.Endpoint)).FirstOrDefault();

            if (existing != null)
            {
                existing.P256dh = model.P256dh;
                existing.Auth = model.Auth;
                unitOfWork.PushSubscriptionRepository.Update(existing);
            }
            else
            {
                var entity = mapper.Map<PushSubscriptionEntity>(model);
                unitOfWork.PushSubscriptionRepository.Insert(entity);
            }

            await unitOfWork.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("unsubscribe")]
        public async Task<IActionResult> Unsubscribe([FromBody] PushSubscriptionModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Endpoint))
            {
                return BadRequest();
            }

            var subscriptions = await unitOfWork.PushSubscriptionRepository.GetAllAsync(
                s => s.Endpoint == model.Endpoint && (model.UserId == 0 || s.UserId == model.UserId));

            if (subscriptions != null && subscriptions.Any())
            {
                unitOfWork.PushSubscriptionRepository.RemoveRange(subscriptions);
                await unitOfWork.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpPost("test")]
        public async Task<IActionResult> SendTestNotification([FromBody] PushNotificationTestRequest request)
        {
            var payload = request ?? new PushNotificationTestRequest();
            var title = string.IsNullOrWhiteSpace(payload.Title) ? DefaultTestTitle : payload.Title.Trim();
            var body = string.IsNullOrWhiteSpace(payload.Body) ? DefaultTestBody : payload.Body.Trim();
            var targetUrl = string.IsNullOrWhiteSpace(payload.Url) ? DefaultTestUrl : payload.Url.Trim();

            int? userId = payload.UserId;
            if (!userId.HasValue && int.TryParse(User.GetId(), out var currentUserId))
            {
                userId = currentUserId;
            }

            if (!userId.HasValue)
            {
                return BadRequest("A user id is required when the caller is not authenticated.");
            }

            var subscriptions = await unitOfWork.PushSubscriptionRepository.GetAllAsync(s => s.UserId == userId.Value);
            if (subscriptions == null || subscriptions.Count == 0)
            {
                return NotFound("No push subscriptions found for the specified user.");
            }

            var client = new WebPushClient();
            var vapidDetails = new VapidDetails(options.Subject, options.PublicKey, options.PrivateKey);
            var serializedPayload = JsonSerializer.Serialize(new
            {
                notification = new
                {
                    title,
                    body,
                    icon = "/icons/icon-192x192.png",
                    badge = "/icons/icon-72x72.png",
                    // This is the data structure the Angular worker expects
                    data = new
                    {
                        onActionClick = new
                        {
                            // Use @default because 'default' is a C# keyword
                            @default = new
                            {
                                operation = "openWindow",
                                url = targetUrl // <-- Your custom URL goes here
                            }
                        },
                        // You can keep your custom data alongside it
                        isTest = true,
                        sentAtUtc = DateTime.UtcNow
                    }
                }
            });

            var attempted = subscriptions.Count;
            var sent = 0;
            var removed = 0;
            var errors = new List<string>();

            foreach (var subscription in subscriptions.ToList())
            {
                var pushSubscription = new WebPush.PushSubscription(subscription.Endpoint, subscription.P256dh, subscription.Auth);
                try
                {
                    await client.SendNotificationAsync(pushSubscription, serializedPayload, vapidDetails, CancellationToken.None);
                    sent++;
                }
                catch (WebPushException ex)
                {
                    var shouldRemove = ex.StatusCode == HttpStatusCode.Gone || ex.StatusCode == HttpStatusCode.NotFound;
                    if (shouldRemove)
                    {
                        unitOfWork.PushSubscriptionRepository.Remove(subscription);
                        removed++;
                    }

                    errors.Add($"Failed for endpoint '{subscription.Endpoint}': {ex.StatusCode}");
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed for endpoint '{subscription.Endpoint}': {ex.Message}");
                }
            }

            if (removed > 0)
            {
                await unitOfWork.SaveChangesAsync();
            }

            return Ok(new
            {
                attempted,
                sent,
                removed,
                errors
            });
        }
    }
}
