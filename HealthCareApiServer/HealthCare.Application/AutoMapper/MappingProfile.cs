using AutoMapper;
using HealthCare.Application.Models;
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
            CreateMap<Hospital, HospitalModel>();
            CreateMap<HospitalModel, Hospital>();
        }
    }
}
