export interface Schedule {
  startTime: string;
  endTime: string;
}

export interface PhlebotomistType {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  serviceArea: string;
  licenseNo: string;
  specialization: string;
  targetGroup: string;
  rating?: string;
  serviceCityTown?: string;
  joiningDate?: string;
  certifications: string[];
  schedules: Schedule[];
  samplesCollected: number;
  status: "Active" | "Inactive";
  location?: string;
  activeOrders?: number;
  completedOrders?: number;
  isActivePhlebo?: boolean;
  isHomeCertified?: boolean;
}
