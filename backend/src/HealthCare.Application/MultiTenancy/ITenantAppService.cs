using Abp.Application.Services;
using HealthCare.MultiTenancy.Dto;

namespace HealthCare.MultiTenancy;

public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
{
}

