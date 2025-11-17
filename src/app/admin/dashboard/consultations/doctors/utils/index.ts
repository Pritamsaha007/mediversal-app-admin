import {
  Doctor,
  DoctorAPI,
  DoctorSlot,
  formatTimeForDisplay,
  TimeSlot,
} from "../types";

export const convertAvailabilityToSlots = (
  availability: Record<string, TimeSlot[]>,
  daysMapping: Record<string, string>
): DoctorSlot[] => {
  const slots: DoctorSlot[] = [];

  Object.entries(availability).forEach(([dayName, timeSlots]) => {
    const dayId = daysMapping[dayName];
    if (!dayId) {
      console.warn(`No day_id found for day: ${dayName}`);
      return;
    }

    timeSlots.forEach((slot) => {
      if (slot.startTime && slot.endTime) {
        const slotData: DoctorSlot = {
          day_id: dayId,
          start_time: slot.startTime,
          end_time: slot.endTime,
          slot_capacity: parseInt(slot.maxPatientsPerSlot) || 0,
        };

        if (slot.id) {
          slotData.id = slot.id;
        }

        slots.push(slotData);
      }
    });
  });

  return slots;
};

export const convertSlotsToAvailability = (
  slots: DoctorSlot[],
  dayMapping: Record<string, string>
): Record<string, TimeSlot[]> => {
  const availability: Record<string, TimeSlot[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  slots.forEach((slot) => {
    let dayName = slot.day;

    if (slot.day_id && dayMapping[slot.day_id]) {
      dayName = dayMapping[slot.day_id];
    }

    if (dayName && availability[dayName]) {
      availability[dayName].push({
        id: slot.id,
        startTime: formatTimeForDisplay(slot.start_time),
        endTime: formatTimeForDisplay(slot.end_time),
        maxPatientsPerSlot:
          slot.slot_capacity != null ? slot.slot_capacity.toString() : "0",
      });
    }
  });

  return availability;
};

export const convertAPIDoctor = (apiDoctor: DoctorAPI): Doctor => {
  return {
    id: apiDoctor.id,
    name: apiDoctor.name,
    mobile_number: apiDoctor.mobile_number,
    specialization_id: "",
    department_id: "",
    experience_in_yrs: apiDoctor.experience_in_yrs,
    consultation_price: parseFloat(apiDoctor.consultation_price),
    about: apiDoctor.about,
    qualifications: apiDoctor.qualifications,
    languages_known: [],
    hospitals_id:
      apiDoctor.hospital && Array.isArray(apiDoctor.hospital)
        ? apiDoctor.hospital.map((h) => h.id)
        : [],
    is_available_online: apiDoctor.is_available_online ?? false,
    is_available_in_person: apiDoctor.is_available_in_person ?? false,
    mci: apiDoctor.mci,
    nmc: apiDoctor.nmc,
    state_registration: apiDoctor.state_registration,
    is_available: apiDoctor.is_available,
    profile_image_url: apiDoctor.profile_image_url,
    rating: parseFloat(apiDoctor.rating),
    specializations: apiDoctor.specializations,
    availability: {},
    hospitalNames:
      apiDoctor.hospital && Array.isArray(apiDoctor.hospital)
        ? apiDoctor.hospital.map((h) => h.name)
        : [],
    doctor_slots: apiDoctor.doctor_slots,
  };
};

export const generateTimeSlots = () => {
  const slots = [];

  for (let hour = 10; hour <= 11; hour++) {
    slots.push(`${hour}:00 AM`);
    slots.push(`${hour}:15 AM`);
    slots.push(`${hour}:30 AM`);
    slots.push(`${hour}:45 AM`);
  }

  for (let hour = 1; hour <= 4; hour++) {
    slots.push(`${hour}:00 PM`);
    slots.push(`${hour}:15 PM`);
    slots.push(`${hour}:30 PM`);
    slots.push(`${hour}:45 PM`);
  }

  return slots;
};

export const tabs = [
  "Basic Information",
  "Doctor Details",
  "Availability",
  "Compliance",
];
