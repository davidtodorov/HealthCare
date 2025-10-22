using AutoMapper;
using HealthCare.Application.Models.Appointments;
using HealthCare.Application.Models.Doctor;
using HealthCare.Application.Models.Hospital;
using HealthCare.Application.Models.Patients;
using HealthCare.Application.Models.Notifications;
using HealthCare.Application.Models.Prescriptions;
using HealthCare.Application.Models.Users;
using HealthCare.Core.Entities;
using HealthCare.Application.Models.Departments;

namespace HealthCare.Application.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Hospital, HospitalModel>().ReverseMap();
            CreateMap<User, UserModel>().ReverseMap();

            CreateMap<DoctorModel, Doctor>();
            CreateMap<Doctor, DoctorModel>()
                .ForMember(dm => dm.FirstName, opts => opts.MapFrom(d => d.User.FirstName))
                .ForMember(dm => dm.LastName, opts => opts.MapFrom(d => d.User.LastName));

            CreateMap<UpdateDoctorModel, Doctor>()
                .ForMember(dm => dm.Id, opts => opts.MapFrom(d => d.Id))
                .ForMember(dm => dm.DepartmentId, opts => opts.MapFrom(d => d.DepartmentId));

            CreateMap<AppointmentModel, Appointment>()
                .ForMember(am => am.DateTime, opts => opts.MapFrom(a => a.DateTime))
                .ForMember(am => am.Notes, opts => opts.MapFrom(a => a.Notes))
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.PatientId, opts => opts.MapFrom(a => a.PatientId))
                .ForMember(am => am.DoctorId, opts => opts.MapFrom(a => a.DoctorId));

            CreateMap<Appointment, AppointmentModel>()
                .ForMember(am => am.DateTime, opts => opts.MapFrom(a => a.DateTime))
                .ForMember(am => am.Reason, opts => opts.MapFrom(a => a.Reason))
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.PatientId, opts => opts.MapFrom(a => a.PatientId))
                .ForMember(am => am.Notes, opts => opts.MapFrom(a => a.Notes))
                .ForMember(am => am.DoctorId, opts => opts.MapFrom(a => a.DoctorId))
                .ForMember(am => am.DoctorName, opts => opts.MapFrom(a => a.Doctor.User.FirstName + " " + a.Doctor.User.LastName));

            CreateMap<UpdateAppointmentModel, Appointment>()
                .ForMember(am => am.Status, opts => opts.MapFrom(a => a.Status))
                .ForMember(am => am.Notes, opts => opts.MapFrom(a => a.Notes))
                .ForMember(am => am.Prescriptions, opts => opts.MapFrom(a => a.Prescriptions));


            CreateMap<Appointment, CreateAppointmentModel>().ReverseMap();

            CreateMap<Department, DepartmentModel>().ReverseMap();

            CreateMap<PrescriptionIntake, PrescriptionIntakeModel>()
                .ForMember(am => am.Id, opts => opts.MapFrom(a => a.Id))
                .ForMember(am => am.ScheduledFor, opts => opts.MapFrom(a => a.ScheduledFor))
                .ForMember(am => am.TakenAt, opts => opts.MapFrom(a => a.TakenAt))
                .ForMember(am => am.PrescriptionIsActive, opts => opts.MapFrom(a => a.Prescription.IsActive));

            CreateMap<PrescriptionIntakeModel, PrescriptionIntake>()
            .ForMember(am => am.Id, opts => opts.MapFrom(a => a.Id))
            .ForMember(am => am.ScheduledFor, opts => opts.MapFrom(a => a.ScheduledFor))
            .ForMember(am => am.TakenAt, opts => opts.MapFrom(a => a.TakenAt))
            .ForMember(am => am.PrescriptionId, opts => opts.MapFrom(a => a.PrescriptionId));

            CreateMap<Prescription, PrescriptionModel>().ReverseMap();
            CreateMap<Patient, PatientModel>()
                .ForMember(am => am.Id, opts => opts.MapFrom(a => a.Id))
                .ForMember(am => am.UserId, opts => opts.MapFrom(a => a.UserId))
                .ForMember(am => am.FirstName, opts => opts.MapFrom(a => a.User.FirstName))
                .ForMember(am => am.LastName, opts => opts.MapFrom(a => a.User.LastName))
                .ForMember(am => am.Email, opts => opts.MapFrom(a => a.User.Email));
            CreateMap<PushSubscription, PushSubscriptionModel>().ReverseMap();
;
        }
    }
}
