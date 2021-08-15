using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace WebApp.Extensions
{
    public static class ConfigurationExtensions
    {
        public static string GetDefaultConnectionString(this IConfiguration configuration)
        {
            return configuration.GetConnectionString("DefaultConnection");
        }
        public static ApplicationSettings GetApplicationSettings(this IServiceCollection services, IConfiguration configuration)
        {
            var appSettingsConfiguration = configuration.GetSection("ApplicationSettings");
            services.Configure<ApplicationSettings>(appSettingsConfiguration);
            var appSettings = appSettingsConfiguration.Get<ApplicationSettings>();

            return appSettings;
        }
    }
}
