namespace WebApp.Options
{
    public class OpenAiOptions
    {
        public const string SectionName = "OpenAI";

        public string? ApiKey { get; set; }

        public string Model { get; set; } = "gpt-4.1-mini";

        public double Temperature { get; set; } = 0.2;
    }
}
