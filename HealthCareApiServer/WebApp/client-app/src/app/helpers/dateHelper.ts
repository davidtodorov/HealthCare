import moment from 'moment';

export function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
    const slots: string[] = [];
    const format = 'HH:mm'; // Standard format for time

    let currentTime = moment(startTime, format);

    // Create a moment object for the end time
    const end = moment(endTime, format);

    // Loop as long as the current time is less than or equal to the end time
    while (currentTime.isSameOrBefore(end)) {
        // Add the current time's formatted string to the array
        slots.push(currentTime.format(format));

        // Advance the time by the specified interval
        currentTime.add(intervalMinutes, 'minutes');
    }

    return slots;
}