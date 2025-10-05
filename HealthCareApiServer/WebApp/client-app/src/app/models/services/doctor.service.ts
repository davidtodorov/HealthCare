import { Injectable } from '@angular/core';
import { Doctor, AppointmentSlot } from '../models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
    private doctors: Doctor[] = [
        {
        id: '1',
        name: 'Dr. Emily Smith',
        specialty: 'Cardiologist',
        bio: 'Board-certified cardiologist with 10+ years of experience in preventive cardiology and interventional procedures.',
        photoUrl: 'assets/doctors/dr-smith.jpg',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [1,2,3,4,5],
        blockedDates: ['2025-10-06']
        },
        {
        id: '2',
        name: 'Dr. Ana Ivanova',
        specialty: 'Dermatologist',
        bio: 'Specializes in medical and cosmetic dermatology with a patient-first approach.',
        photoUrl: 'assets/doctors/dr-ivanova.jpg',
        workingHours: { start: '10:00', end: '18:00' },
        workingDays: [1,2,3,4,5]
        },
        {
        id: '3',
        name: 'Dr. Michael Lee',
        specialty: 'Pediatrician',
        bio: 'Pediatric specialist focused on preventive care and adolescent medicine.',
        photoUrl: 'assets/doctors/dr-lee.jpg',
        workingHours: { start: '08:30', end: '15:30' },
        workingDays: [1,2,3,4,6] // works Sat too
        }
    ];

    // In-memory booked slots demo storage
    private booked: AppointmentSlot[] = [
    { doctorId: '1', date: '2025-10-07', time: '10:00', isBooked: true },
    { doctorId: '2', date: '2025-10-08', time: '11:30', isBooked: true }
    ];


    getDoctors(): Doctor[] {
        return this.doctors;
    }


    getDoctor(id: string): Doctor | undefined {
        return this.doctors.find(d => d.id === id);
    }

    // Generate 30 days of availability from today
getAvailableDays(doctorId: string): string[] {
const doctor = this.getDoctor(doctorId);
if (!doctor) return [];


const today = new Date();
today.setHours(0,0,0,0);


const days: string[] = [];
for (let i = 0; i < 60; i++) {
const d = new Date(today);
d.setDate(today.getDate() + i);
const weekday = d.getDay();
const iso = d.toISOString().slice(0,10);
const isBlocked = doctor.blockedDates?.includes(iso);
if (doctor.workingDays.includes(weekday) && !isBlocked) {
days.push(iso);
}
}
return days;
}


// 30-min slots within working hours for a given date
getAvailableSlots(doctorId: string, dateIso: string): AppointmentSlot[] {
    const doctor = this.getDoctor(doctorId);
    if (!doctor) return [];


    const [startH, startM] = doctor.workingHours.start.split(':').map(Number);
    const [endH, endM] = doctor.workingHours.end.split(':').map(Number);


    const start = new Date(`${dateIso}T${doctor.workingHours.start}:00`);
    const end = new Date(`${dateIso}T${doctor.workingHours.end}:00`);


    const slots: AppointmentSlot[] = [];
    const step = 30; // minutes


    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + step)) {
            const hh = String(t.getHours()).padStart(2,'0');
            const mm = String(t.getMinutes()).padStart(2,'0');
            const time = `${hh}:${mm}`;
            const isBooked = this.booked.some(b => b.doctorId === doctorId && b.date === dateIso && b.time === time);
            slots.push({ doctorId, date: dateIso, time, isBooked });
        }
        return slots;
    }


    bookSlot(slot: AppointmentSlot): { success: boolean; message: string } {
        const exists = this.booked.some(b => b.doctorId === slot.doctorId && b.date === slot.date && b.time === slot.time);
        if (exists) return { success: false, message: 'That slot was just booked by someone else. Please pick another.' };
        this.booked.push({ ...slot, isBooked: true });
        return   { success: true, message: 'Your appointment has been scheduled!' };
    }
}