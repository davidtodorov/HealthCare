using AutoMapper;
using HealthCare.Application.Models;
using HealthCare.Application.Models.Appointments;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Hospital;
using HealthCare.Application.Models.Patients;
using HealthCare.Application.Models.Prescriptions;
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

            CreateMap<Appointment, AppointmentModel>()
                .ForMember(am => am.DateTime, opts => opts.MapFrom(a => a.DateTime))
                .ForMember(am => am.Reason, opts => opts.MapFrom(a => a.Reason))
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.PatientId, opts => opts.MapFrom(a => a.PatientId))
                .ForMember(am => am.Notes, opts => opts.MapFrom(a => a.Notes))
                .ForMember(am => am.DoctorId, opts => opts.MapFrom(a => a.DoctorId));

            CreateMap<UpdateAppointmentModel, Appointment>()
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.Notes, opts => opts.MapFrom(a => a.Notes))
                .ForMember(am => am.Prescriptions, opts => opts.MapFrom(a => a.Prescriptions))
                ;


            CreateMap<Appointment, CreateAppointmentModel>().ReverseMap();

            CreateMap<Department, DepartmentModel>().ReverseMap();
            CreateMap<PrescriptionIntake, PrescriptionIntakeModel>().ReverseMap();

            CreateMap<Prescription, PrescriptionModel>().ReverseMap();
            CreateMap<Patient, PatientModel>()
                .ForMember(am => am.Id, opts => opts.MapFrom(a => a.Id))
                .ForMember(am => am.FirstName, opts => opts.MapFrom(a => a.User.FirstName))
                .ForMember(am => am.LastName, opts => opts.MapFrom(a => a.User.LastName))
                .ForMember(am => am.Email, opts => opts.MapFrom(a => a.User.Email));
;
        }
    }
}
