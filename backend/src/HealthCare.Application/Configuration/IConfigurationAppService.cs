using HealthCare.Configuration.Dto;
using System.Threading.Tasks;

namespace HealthCare.Configuration;

public interface IConfigurationAppService
{
    Task ChangeUiTheme(ChangeUiThemeInput input);
}
