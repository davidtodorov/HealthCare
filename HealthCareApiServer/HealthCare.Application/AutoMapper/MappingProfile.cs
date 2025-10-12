using AutoMapper;
using HealthCare.Application.Models;
using HealthCare.Application.Models.Appointments;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Hospital;
using HealthCare.Application.Models.Users;
using HealthCare.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HealthCare.Application.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Hospital, HospitalModel>().ReverseMap(); //.ForMember(hm => hm.DoctorModels, opts => opts.MapFrom(h => h.Doctors)).ReverseMap();
            CreateMap<User, UserModel>().ReverseMap();

            CreateMap<DoctorModel, Doctor>();
            CreateMap<Doctor, DoctorModel>()
                .ForMember(dm => dm.FirstName, opts => opts.MapFrom(d => d.User.FirstName))
                .ForMember(dm => dm.LastName, opts => opts.MapFrom(d => d.User.LastName));

            CreateMap<AppointmentModel, Appointment>()
                .ForMember(am => am.DateTime, opts => opts.MapFrom(a => a.DateTime))
                .ForMember(am => am.Reason, opts => opts.MapFrom(a => a.Reason))
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.PatientId, opts => opts.MapFrom(a => a.PatientId))
                .ForMember(am => am.DoctorId, opts => opts.MapFrom(a => a.DoctorId));

            CreateMap<Department, DepartmentModel>();
        }
    }
}
