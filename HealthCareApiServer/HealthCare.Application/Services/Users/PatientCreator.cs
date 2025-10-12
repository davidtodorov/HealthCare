using AutoMapper;
using HealthCare.Application.Interfaces.Doctors;
using HealthCare.Application.Interfaces.Patients;
using HealthCare.Application.Interfaces.User;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Users;
using HealthCare.Core;
using HealthCare.Core.Entities;
using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Application.Services.Users
{
    public class PatientCreator : IPatientCreator
    {
        private IUserCreator userCreator;
        private UserManager<User> userManager;
        private IUnitOfWork unitOfWork;
        private IMapper mapper;

        public PatientCreator(IUserCreator userCreator, UserManager<User> userManager, IUnitOfWork unitOfWork, IMapper mapper)
        {
            this.userCreator = userCreator;
            this.userManager = userManager;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }
        public async Task<Result> CreatePatient(RegisterUserRequestModel model)
        {
            using (var transaction = await unitOfWork.BeginTransactionAsync())
            {
                var result = await userCreator.CreateUserAsync(model);
                if (!result.Result.Succeeded)
                {
                    return result.Result.Errors.FirstOrDefault()?.Description ?? "User creation failed";
                }

                await userManager.AddToRoleAsync(result.User, RoleConstants.PATIENT_ROLE);

                var patient = new Patient()
                {
                    UserId = result.User.Id
                };

                try
                {
                    //unitOfWork.PatientRepository.Insert(patient);
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
