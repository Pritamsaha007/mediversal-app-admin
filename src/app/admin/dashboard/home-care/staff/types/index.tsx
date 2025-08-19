export interface Staff {
  id: number;
  name: string;
  phone: string;
  address: string;
  experience: string;
  rating: number;
  status: "Available" | "Busy" | "Not available";
  departments: string[];
  position: string;
  joinDate: string;
  email?: string;
  certifications?: string[];
  avatar?: string;
  activeOrders?: number;
  completedOrders?: number;
}
