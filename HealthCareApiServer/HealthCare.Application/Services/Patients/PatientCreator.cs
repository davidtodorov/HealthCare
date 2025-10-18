using AutoMapper;
using HealthCare.Application.Interfaces.Patients;
using HealthCare.Application.Interfaces.User;
using HealthCare.Application.Models.Users;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;

namespace HealthCare.Application.Services.Doctors
{
    public class PatientCreator : IPatientCreator
    {
        private IUserCreator userCreator;
        private UserManager<User> userManager;
        private IUnitOfWork unitOfWork;

        public PatientCreator(IUserCreator userCreator, UserManager<User> userManager, IUnitOfWork unitOfWork)
        {
            this.userCreator = userCreator;
            this.userManager = userManager;
            this.unitOfWork = unitOfWork;
        }
        public async Task<CreateUserResult> CreatePatient(RegisterUserRequestModel model)
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
                    result.User = null;
                    return result;
                }

                await userManager.AddToRoleAsync(result.User, RoleConstants.PATIENT_ROLE);

                var patient = new Patient()
                {
                    UserId = result.User.Id,
                };

                try
                {
                    unitOfWork.PatientRepository.Insert(patient);
                    await unitOfWork.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return result;
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    result.User = null;
                    result.Result = IdentityResult.Failed(new IdentityError { Description = e.Message });
                    return result;
                }
            }
        }
    }
}
