export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  maxPatientsPerSlot: string;
}

export interface DoctorSlot {
  id?: string;
  day?: string;
  day_id: string;
  start_time: string;
  end_time: string;
  slot_capacity: number;
}
export const formatTimeForDisplay = (time: string): string => {
  if (!time) return "";
  return time.substring(0, 5);
};

export interface Doctor {
  id: string;
  name: string;
  mobile_number: string;
  specialization_id: string;
  department_id: string;
  experience_in_yrs: number;
  consultation_price: number;
  about: string;
  qualifications: string;
  languages_known: string[];
  hospitals_id: string[];
  is_available_online: boolean;
  is_available_in_person: boolean;
  mci: string;
  nmc: string;
  state_registration: string;
  is_available: boolean;
  profile_image_url: string | File | null;
  hospitalNames?: string[];
  rating?: number;
  specializations?: string;
  availability: Record<string, TimeSlot[]>;
  hospitalNamesMap?: Record<string, string>;
  doctor_slots?: DoctorSlot[];
}

export interface DoctorAPI {
  id: string;
  name: string;
  mobile_number: string;
  role_name: string;
  experience_in_yrs: number;
  specializations: string;
  departments: string;
  consultation_price: string;
  about: string;
  qualifications: string;
  languages_known: string[];
  hospital: Array<{
    id: string;
    name: string;
  }>;
  is_available_online: boolean;
  is_available_in_person: boolean;
  is_available: boolean;
  mci: string;
  nmc: string;
  state_registration: string;
  rating: string;
  profile_image_url: string;
  doctor_slots: DoctorSlot[];
}

// Helper function to convert availability to doctor_slots
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
          day_id: dayId, // This is now guaranteed to be a string
          start_time: slot.startTime,
          end_time: slot.endTime,
          slot_capacity: parseInt(slot.maxPatientsPerSlot) || 0,
        };

        // Include id for updates
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
    // Use slot.day directly since API returns day names
    let dayName = slot.day;

    // If day_id is provided and dayMapping exists, use it
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
    hospitals_id: apiDoctor.hospital ? apiDoctor.hospital.map((h) => h.id) : [],
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
    hospitalNames: apiDoctor.hospital
      ? apiDoctor.hospital.map((h) => h.name)
      : [],
    doctor_slots: apiDoctor.doctor_slots,
  };
};

export const generateTimeSlots = () => {
  const slots = [];

  // Morning slots
  for (let hour = 10; hour <= 11; hour++) {
    slots.push(`${hour}:00 AM`);
    slots.push(`${hour}:15 AM`);
    slots.push(`${hour}:30 AM`);
    slots.push(`${hour}:45 AM`);
  }

  // Afternoon slots
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
