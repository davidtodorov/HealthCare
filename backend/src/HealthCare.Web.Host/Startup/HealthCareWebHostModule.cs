using Abp.Modules;
using Abp.Reflection.Extensions;
using HealthCare.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HealthCare.Web.Host.Startup
{
    [DependsOn(
       typeof(HealthCareWebCoreModule))]
    public class HealthCareWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public HealthCareWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(HealthCareWebHostModule).GetAssembly());
        }
    }
}
