export interface Order {
  id: string;
  bookingId: string;
  patientName: string;
  patientContact: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialization: string;
  consultationDate: string;
  consultationTime: string;
  consultationType: "online" | "in-person";
  consultationStatus: "completed" | "scheduled" | "in-progress" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded" | "failed";
  paymentMethod: string;
  amount: number;
  gst: number;
  totalAmount: number;
  invoiceId: string;
  bookedDate: string;
  consultationLanguage: string;
  duration: number;
  hospital?: string;
  hospitalLocation?: string;
  aadhaarNumber?: string;
  symptoms?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersData: Order[] = [
  {
    id: "order-1",
    bookingId: "MH0003456",
    patientName: "Firoz Ansari",
    patientContact: "(+91) 62017 53532",
    patientEmail: "harish.gupta@email.com",
    doctorName: "Dr. Rajesh Sharma",
    doctorSpecialization: "Cardiology",
    consultationDate: "15 May 2023",
    consultationTime: "10:30 AM",
    consultationType: "online",
    consultationStatus: "completed",
    paymentStatus: "paid",
    paymentMethod: "Credit/Debit Card",
    amount: 1149.75,
    gst: 100.0,
    totalAmount: 1249.75,
    invoiceId: "RX-2023-001",
    bookedDate: "17 May 2023",
    consultationLanguage: "Hindi",
    duration: 30,
    aadhaarNumber: "1234-5678-9012",
    symptoms: "Chest pain and shortness of breath during physical activity",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T11:00:00Z",
  },
  {
    id: "order-2",
    bookingId: "MH0003457",
    patientName: "Anshuman Gupta",
    patientContact: "(+91) 62017 53532",
    patientEmail: "raghunath.thakur@email.com",
    doctorName: "Dr. Mahesh Sharma",
    doctorSpecialization: "Ophthalmologist",
    consultationDate: "17 Sept. 2023",
    consultationTime: "2:00 PM",
    consultationType: "in-person",
    consultationStatus: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Net Banking",
    amount: 1149.75,
    gst: 100.0,
    totalAmount: 1249.75,
    invoiceId: "RX-2023-002",
    bookedDate: "17 May 2023",
    consultationLanguage: "English",
    duration: 30,
    hospital: "Mediversal Multi Super Speciality Hospital",
    hospitalLocation: "123 Medical Street, Mumbai, Maharashtra 400001",
    aadhaarNumber: "1234-5678-9013",
    symptoms: "Blurred vision and eye strain",
    createdAt: "2023-09-15T14:00:00Z",
    updatedAt: "2023-09-16T09:00:00Z",
  },
  {
    id: "order-3",
    bookingId: "MH0003458",
    patientName: "Pritam Saha",
    patientContact: "(+91) 62017 53532",
    patientEmail: "raghunath.thakur@email.com",
    doctorName: "Dr. Rajesh Sharma",
    doctorSpecialization: "Cardiology",
    consultationDate: "22 Sept. 2025",
    consultationTime: "11:00 AM",
    consultationType: "in-person",
    consultationStatus: "scheduled",
    paymentStatus: "pending",
    paymentMethod: "UPI",
    amount: 1149.75,
    gst: 100.0,
    totalAmount: 1249.75,
    invoiceId: "RX-2025-003",
    bookedDate: "17 May 2023",
    consultationLanguage: "Hindi",
    duration: 30,
    hospital: "Mediversal Multi Super Speciality Hospital",
    hospitalLocation: "123 Medical Street, Mumbai, Maharashtra 400001",
    aadhaarNumber: "1234-5678-9013",
    symptoms: "Regular checkup for heart condition",
    createdAt: "2025-09-20T11:00:00Z",
    updatedAt: "2025-09-20T11:00:00Z",
  },
  {
    id: "order-4",
    bookingId: "MH0003459",
    patientName: "Vivek Pandey",
    patientContact: "(+91) 62017 53532",
    patientEmail: "rakesh.kumar@email.com",
    doctorName: "Dr. Rajesh Sharma",
    doctorSpecialization: "Cardiology",
    consultationDate: "22 Sept. 2025",
    consultationTime: "3:30 PM",
    consultationType: "online",
    consultationStatus: "in-progress",
    paymentStatus: "failed",
    paymentMethod: "UPI",
    amount: 1149.75,
    gst: 100.0,
    totalAmount: 1249.75,
    invoiceId: "RX-2025-004",
    bookedDate: "17 May 2023",
    consultationLanguage: "English",
    duration: 30,
    aadhaarNumber: "1234-5678-9014",
    symptoms: "Hypertension monitoring and medication adjustment",
    createdAt: "2025-09-22T15:30:00Z",
    updatedAt: "2025-09-22T15:30:00Z",
  },
];
