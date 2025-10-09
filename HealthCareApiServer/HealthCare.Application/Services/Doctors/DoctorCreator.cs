using AutoMapper;
using HealthCare.Application.Interfaces.Doctor;
using HealthCare.Application.Interfaces.User;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.User;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Services.Doctors
{
    public class DoctorCreator : IDoctorCreator
    {
        private IUserCreator userCreator;
        private UserManager<Core.Entities.User> userManager;
        private IUnitOfWork unitOfWork;
        private IMapper mapper;

        public DoctorCreator(IUserCreator userCreator, UserManager<Core.Entities.User> userManager, IUnitOfWork unitOfWork, IMapper mapper)
        {
            this.userCreator = userCreator;
            this.userManager = userManager;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }
        public async Task<Result> CreateDoctor(CreateDoctorModel model)
        {
            var registerUserModel = new RegisterUserRequestModel()
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Username = model.Username,
                Password = model.Password
            };
            var result = await userCreator.CreateUserAsync(registerUserModel);
            if (result.Result.Succeeded)
            {
                await userManager.AddToRoleAsync(result.User, RoleConstants.DOCTOR_ROLE);
            }

            //var user = unitOfWork.UserRepository.GetById(result.User.Id);

            var doctorFromDTO = mapper.Map<CreateDoctorModel, Doctor>(model);

            var doctor = new Doctor()
            {
                UserId = result.User.Id,
                //DepartmentId = model.DepartmentId,
                //HospitalId = model.HospitalId
            };

            try
            {
                unitOfWork.DoctorRepository.Insert(doctorFromDTO);
            }
            catch (Exception e)
            {
                return e.Message;
            }
            await unitOfWork.SaveChangesAsync();
            return true;

            //TODO: Add doctor's department and hospital

        }
    }
}
