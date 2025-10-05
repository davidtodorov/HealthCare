export interface Doctor {
id: string;
name: string;
specialty: string;
bio: string;
photoUrl: string;
// Working hours in 24h format, e.g., { start: '09:00', end: '17:00' }
workingHours: { start: string; end: string };
// Weekday numbers available (0=Sun … 6=Sat). Example: Mon–Fri => [1,2,3,4,5]
workingDays: number[];
// Optional explicit unavailable dates (ISO YYYY-MM-DD)
blockedDates?: string[];
}


export interface AppointmentSlot {
doctorId: string;
date: string; // YYYY-MM-DD
time: string; // HH:mm
isBooked?: boolean;
}