using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using AutoMapper;
using HealthCare.Application.Models.Hospital;
using HealthCare.Application.Models.User;

namespace WebApp.Controllers
{
    public class UserController : RestController<User, UserModel>
    {
        public UserController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {

        }
    }
}
