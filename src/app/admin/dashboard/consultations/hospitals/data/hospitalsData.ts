export interface OperatingHours {
  [key: string]: {
    id?: string;
    startTime: string;
    endTime: string;
  };
}

export interface Hospital {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string[];
    website?: string;
  };
  description: string;
  departments: string[];
  operatingHours: OperatingHours;
  emergencyServices: boolean;
  image?: File | string | null;
  created_by?: string;
  updated_by?: string;
}

export const tabs = [
  "Basic Information",
  "Hospital Details",
  "Departments",
  "Operating Hours",
];

export const convertAPIToLocalHospital = (apiHospital: any): Hospital => {
  const operatingHours: OperatingHours = {};
  apiHospital.operating_hours?.forEach((hour: any) => {
    operatingHours[hour.day] = {
      id: hour.id,
      startTime: hour.start_time,
      endTime: hour.end_time,
    };
  });

  return {
    id: apiHospital.id,
    name: apiHospital.name,
    address: {
      line1: apiHospital.address_line1 || "",
      line2: apiHospital.address_line2 || "",
      city: apiHospital.city || "",
      state: apiHospital.state || "",
      pinCode: apiHospital.pincode || "",
      country: apiHospital.country || "",
      landmark: apiHospital.landmark || "",
    },
    contact: {
      phone: apiHospital.contact ? [apiHospital.contact] : [],
      email: apiHospital.email ? [apiHospital.email] : [],
      website: apiHospital.website || "",
    },
    description: apiHospital.description || "",
    departments: apiHospital.departments || [],
    operatingHours,
    emergencyServices: apiHospital.is_available_24_7 || false,
    image: apiHospital.display_pic || null,
  };
};
