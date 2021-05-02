﻿using HealthCare.Core.Entities;
using HealthCare.Application.Models;
using HealthCare.Infrastructure;
using AutoMapper;

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
