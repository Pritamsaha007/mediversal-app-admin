export interface OperatingHours {
  [key: string]: {
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

export const departmentOptions = [
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Homeopathy",
  "Neurology",
  "Psychiatry",
  "Paediatrics",
  "Urology",
  "Surgery",
  "Gynecology",
  "Radiology",
  "Ophthalmology",
  "Gastroenterology",
  "General Medicine",
  "Others",
];

export const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const tabs = [
  "Basic Information",
  "Hospital Details",
  "Departments",
  "Operating Hours",
];

export const hospitalsData: Hospital[] = [
  {
    id: "hospital-1",
    name: "Mediversal Multi Super Speciality Hospital",
    address: {
      line1: "Doctors Colony, Kankarbagh",
      line2: "",
      city: "Patna",
      state: "Bihar",
      pinCode: "800020",
      country: "India",
    },
    contact: {
      phone: ["+91 62017 53532"],
      email: ["info@mediversal.com"],
      website: "www.mediversalhospital.com",
    },
    description:
      "Mediversal Hospital is chest / respiratory diseases specialist. He has trained in the best institution in India. He has done his MBBS from Manipal University. Done his post-graduation (DNB) in cardiology from Apollo hospital, Chennai.",
    departments: [
      "Cardiology",
      "Orthopedics",
      "Paediatrics",
      "Radiology",
      "Gastroenterology",
      "Homeopathy",
      "Psychiatry",
    ],
    operatingHours: {
      Monday: { startTime: "06:00", endTime: "23:30" },
      Tuesday: { startTime: "06:00", endTime: "23:30" },
      Wednesday: { startTime: "06:00", endTime: "23:30" },
      Thursday: { startTime: "06:00", endTime: "23:30" },
      Friday: { startTime: "06:00", endTime: "23:30" },
      Saturday: { startTime: "06:00", endTime: "23:30" },
      Sunday: { startTime: "06:00", endTime: "23:30" },
    },
    emergencyServices: true,
    image: null,
  },
  {
    id: "hospital-2",
    name: "Mediversal Health Studio",
    address: {
      line1: "Mona Cinema Enclave, Gandhi Maidan Rd.",
      line2: "",
      city: "Patna",
      state: "Bihar",
      pinCode: "800001",
      country: "India",
    },
    contact: {
      phone: ["+91 62017 53532"],
      email: ["info@mediversalhealth.com"],
    },
    description:
      "Mediversal Health Studio provides comprehensive healthcare services with modern facilities and experienced medical professionals.",
    departments: [
      "Cardiology",
      "Orthopedics",
      "Paediatrics",
      "Radiology",
      "Gastroenterology",
      "Homeopathy",
      "Psychiatry",
    ],
    operatingHours: {
      Monday: { startTime: "06:00", endTime: "23:30" },
      Tuesday: { startTime: "06:00", endTime: "23:30" },
      Wednesday: { startTime: "06:00", endTime: "23:30" },
      Thursday: { startTime: "06:00", endTime: "23:30" },
      Friday: { startTime: "06:00", endTime: "23:30" },
      Saturday: { startTime: "06:00", endTime: "23:30" },
      Sunday: { startTime: "06:00", endTime: "23:30" },
    },
    emergencyServices: false,
    image: null,
  },
  {
    id: "hospital-3",
    name: "Mediversal Maatri (Mother & Child Care)",
    address: {
      line1: "Road 2B, Rajendra Nagar",
      line2: "",
      city: "Patna",
      state: "Bihar",
      pinCode: "800016",
      country: "India",
    },
    contact: {
      phone: ["+91 62017 53532"],
      email: ["info@mediversalmaatri.com"],
    },
    description:
      "Specialized in mother and child care with dedicated gynecology and pediatrics departments.",
    departments: [
      "Cardiology",
      "Orthopedics",
      "Paediatrics",
      "Radiology",
      "Gastroenterology",
      "Homeopathy",
      "Psychiatry",
    ],
    operatingHours: {
      Monday: { startTime: "06:00", endTime: "23:30" },
      Tuesday: { startTime: "06:00", endTime: "23:30" },
      Wednesday: { startTime: "06:00", endTime: "23:30" },
      Thursday: { startTime: "06:00", endTime: "23:30" },
      Friday: { startTime: "06:00", endTime: "23:30" },
      Saturday: { startTime: "06:00", endTime: "23:30" },
      Sunday: { startTime: "06:00", endTime: "23:30" },
    },
    emergencyServices: true,
    image: null,
  },
  {
    id: "hospital-4",
    name: "Mediversal Sparsh Foundation",
    address: {
      line1: "Sri Krishna Nagar, Kidwaipuri",
      line2: "",
      city: "Patna",
      state: "Bihar",
      pinCode: "800001",
      country: "India",
    },
    contact: {
      phone: ["+91 94655 35324"],
      email: ["info@mediversalsparsh.com"],
    },
    description:
      "Community healthcare foundation providing affordable medical services to all sections of society.",
    departments: [
      "Cardiology",
      "Orthopedics",
      "Paediatrics",
      "Radiology",
      "Gastroenterology",
      "Homeopathy",
      "Psychiatry",
    ],
    operatingHours: {
      Monday: { startTime: "06:00", endTime: "23:30" },
      Tuesday: { startTime: "06:00", endTime: "23:30" },
      Wednesday: { startTime: "06:00", endTime: "23:30" },
      Thursday: { startTime: "06:00", endTime: "23:30" },
      Friday: { startTime: "06:00", endTime: "23:30" },
      Saturday: { startTime: "06:00", endTime: "23:30" },
      Sunday: { startTime: "06:00", endTime: "23:30" },
    },
    emergencyServices: true,
    image: null,
  },
];
