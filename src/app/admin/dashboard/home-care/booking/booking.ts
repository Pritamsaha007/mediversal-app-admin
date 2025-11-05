export interface DetailedBooking {
  id: string;
  actualOrderId: string;
  bookingId: string;
  date: string;
  customer: {
    name: string;
    customer_id: string;
    location: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
  };
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  payment: "Partial Payment" | "Paid" | "Refunded";
  service: string;
  serviceDetails: {
    name: string;
    description: string;
    pricePerDay: number;
  };
  total: number;
  gst: number;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  scheduled: string;
  duration: string;
  currentMedication: string;
  medicalCondition: string;
  emergencyContact: {
    name: string;
    number: string;
  };
  assignedStaff: string | null;
  rawDate: Date;
}
