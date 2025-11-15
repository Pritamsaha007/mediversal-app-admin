import { Hospital, OperatingHours } from "../types";

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

  const labTestIds = apiHospital.lab_tests?.map((test: any) => test.id) || [];

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
