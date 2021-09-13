﻿using AutoMapper;
using HealthCare.Application.Models;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Hospital;
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
            CreateMap<Hospital, HospitalModel>().ForMember(hm => hm.DoctorModels, opts => opts.MapFrom(h => h.Doctors)).ReverseMap();
            CreateMap<User, UserModel>().ReverseMap();
            CreateMap<Doctor, DoctorModel>()
                .ForMember(dm => dm.FirstName, opts => opts.MapFrom(d => d.User.FirstName))
                .ForMember(dm => dm.LastName, opts => opts.MapFrom(d => d.User.LastName))
                .ForMember(dm => dm.HospitalName, opts => opts.MapFrom(d => d.Hospital.Name))
                .ReverseMap();
            CreateMap<Department, DepartmentModel>().ReverseMap();
        }
    }
}
