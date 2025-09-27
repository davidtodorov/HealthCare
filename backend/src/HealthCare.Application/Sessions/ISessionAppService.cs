using Abp.Application.Services;
using HealthCare.Sessions.Dto;
using System.Threading.Tasks;

namespace HealthCare.Sessions;

public interface ISessionAppService : IApplicationService
{
    Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
}
