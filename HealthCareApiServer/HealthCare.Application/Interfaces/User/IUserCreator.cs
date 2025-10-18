using HealthCare.Application.Models.Users;
using System.Threading.Tasks;

namespace HealthCare.Application.Interfaces.User
{
    public interface IUserCreator
    {
        Task<CreateUserResult> CreateUserAsync(RegisterUserRequestModel model);
    }
}
