using Abp.Application.Services;
using HealthCare.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace HealthCare.Authorization.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

    Task<RegisterOutput> Register(RegisterInput input);
}
