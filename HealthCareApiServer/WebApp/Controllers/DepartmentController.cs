using AutoMapper;
using HealthCare.Application.Models;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;

namespace WebApp.Controllers
{
    public class DepartmentController : RestController<Department, DepartmentModel, DepartmentModel>
    {
        public DepartmentController(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
        {
        }

    }
}
