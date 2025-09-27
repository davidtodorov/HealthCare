using Abp.Authorization;
using Abp.Runtime.Session;
using HealthCare.Configuration.Dto;
using System.Threading.Tasks;

namespace HealthCare.Configuration;

[AbpAuthorize]
public class ConfigurationAppService : HealthCareAppServiceBase, IConfigurationAppService
{
    public async Task ChangeUiTheme(ChangeUiThemeInput input)
    {
        await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
    }
}
