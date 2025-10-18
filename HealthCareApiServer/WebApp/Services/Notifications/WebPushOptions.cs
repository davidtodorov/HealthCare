namespace WebApp.Services.Notifications
{
    public class WebPushOptions
    {
        public string Subject { get; set; } = "mailto:admin@example.com";

        public string PublicKey { get; set; } = string.Empty;

        public string PrivateKey { get; set; } = string.Empty;

        public int ReminderLookAheadMinutes { get; set; } = 15;

        public int ReminderIntervalSeconds { get; set; } = 60;
    }
}
