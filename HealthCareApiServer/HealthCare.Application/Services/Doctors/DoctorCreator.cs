using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Interfaces.User;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Users;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.Application.Services.Doctors
{
    public class DoctorCreator : IDoctorCreator
    {
        private IUserCreator userCreator;
        private UserManager<User> userManager;
        private IUnitOfWork unitOfWork;

        public DoctorCreator(IUserCreator userCreator, UserManager<User> userManager, IUnitOfWork unitOfWork)
        {
            this.userCreator = userCreator;
            this.userManager = userManager;
            this.unitOfWork = unitOfWork;
        }
        public async Task<Result> CreateDoctor(CreateDoctorModel model)
        {
            using (var transaction = await unitOfWork.BeginTransactionAsync())
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
                if (!result.Result.Succeeded)
                {
                    return result.Result.Errors.FirstOrDefault()?.Description ?? "User creation failed";
                }

                await userManager.AddToRoleAsync(result.User, RoleConstants.DOCTOR_ROLE);

                var doctor = new Doctor()
                {
                    UserId = result.User.Id,
                    DepartmentId = model.DepartmentId,
                    HospitalId = model.HospitalId
                };

                try
                {
                    unitOfWork.DoctorRepository.Insert(doctor);
                    await unitOfWork.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    return e.Message;
                }
            }
        }
    }
}
