using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using AutoMapper;
using HealthCare.Application.Models.Hospital;

namespace HealthCare.API.Controllers
{
    public class UserController : RestController<User, HospitalModel>
    {
        public UserController(IUnitOfWork unitOfWork, IMapper mapper)
            : base(unitOfWork, mapper)
        {

        }
    }
}
