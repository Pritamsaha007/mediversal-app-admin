export interface Staff {
  id: string;
  name: string;
  phone: string;
  address?: string;
  experience: string;
  rating: number;
  status: string;
  departments: string[];
  position: string;
  joinDate?: string;
  email: string;
  certifications: string[];
  activeOrders?: number;
  completedOrders?: number;
  // Optional: Add these if you want to store API data
  profile_image_url?: string; // From API
  role_id?: string; // If API uses role IDs
}
