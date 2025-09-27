using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using HealthCare.Configuration;
using HealthCare.EntityFrameworkCore;
using HealthCare.Migrator.DependencyInjection;
using Castle.MicroKernel.Registration;
using Microsoft.Extensions.Configuration;

namespace HealthCare.Migrator;

[DependsOn(typeof(HealthCareEntityFrameworkModule))]
public class HealthCareMigratorModule : AbpModule
{
    private readonly IConfigurationRoot _appConfiguration;

    public HealthCareMigratorModule(HealthCareEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

        _appConfiguration = AppConfigurations.Get(
            typeof(HealthCareMigratorModule).GetAssembly().GetDirectoryPathOrNull()
        );
    }

    public override void PreInitialize()
    {
        Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
            HealthCareConsts.ConnectionStringName
        );

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
        Configuration.ReplaceService(
            typeof(IEventBus),
            () => IocManager.IocContainer.Register(
                Component.For<IEventBus>().Instance(NullEventBus.Instance)
            )
        );
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(HealthCareMigratorModule).GetAssembly());
        ServiceCollectionRegistrar.Register(IocManager);
    }
}
