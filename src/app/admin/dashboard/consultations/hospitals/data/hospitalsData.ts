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
  lab_test_ids: string[];
  health_package_ids: string[];
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

  // Extract lab test IDs from the nested lab_tests array
  const labTestIds = apiHospital.lab_tests?.map((test: any) => test.id) || [];

  // Extract health package IDs from the nested health_packages array
  const healthPackageIds =
    apiHospital.health_packages?.map((pkg: any) => pkg.id) || [];

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

    lab_test_ids: labTestIds,
    health_package_ids: healthPackageIds,

    operatingHours,
    emergencyServices: apiHospital.is_available_24_7 || false,
    image: apiHospital.display_pic || null,
  };
};
