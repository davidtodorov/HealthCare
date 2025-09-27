using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using HealthCare.EntityFrameworkCore;
using HealthCare.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace HealthCare.Web.Tests;

[DependsOn(
    typeof(HealthCareWebMvcModule),
    typeof(AbpAspNetCoreTestBaseModule)
)]
public class HealthCareWebTestModule : AbpModule
{
    public HealthCareWebTestModule(HealthCareEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
    }

    public override void PreInitialize()
    {
        Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(HealthCareWebTestModule).GetAssembly());
    }

    public override void PostInitialize()
    {
        IocManager.Resolve<ApplicationPartManager>()
            .AddApplicationPartsIfNotAddedBefore(typeof(HealthCareWebMvcModule).Assembly);
    }
}