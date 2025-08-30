// export interface Booking {
//   id: string;
//   bookingId: string;
//   date: string;
//   customer: {
//     name: string;
//     location: string;
//     age: number;
//     gender: string;
//     phone: string;
//     email: string;
//     address: string;
//   };
//   status: "Pending Assignment" | "In Progress" | "Completed" | "Cancelled";
//   payment: "Partial Payment" | "Paid" | "Refunded";
//   service: string;
//   serviceDetails: {
//     name: string;
//     description: string;
//     pricePerDay: number;
//   };
//   total: number;
//   gst: number;
//   priority: "High Priority" | "Medium Priority" | "Low Priority";
//   scheduled: string;
//   duration: string;
//   currentMedication: string;
//   medicalCondition: string;
//   emergencyContact: {
//     name: string;
//     number: string;
//   };
//   assignedStaff: string | null;
// }

// export const bookingsData: Booking[] = [
//   {
//     id: "ORD-001",
//     bookingId: "BOOK846513",
//     date: "15 Jan 2024",
//     customer: {
//       name: "John Doe",
//       location: "Bandra West, Mumbai",
//       age: 78,
//       gender: "Male",
//       phone: "+91 98765 43211",
//       email: "john.doe@example.com",
//       address: "456 Oak Avenue, Andheri East, Mumbai - 4000069",
//     },
//     status: "Pending Assignment",
//     payment: "Partial Payment",
//     service: "General Nursing",
//     serviceDetails: {
//       name: "Oxygen Concentrator",
//       description: "5L capacity continuous oxygen supply",
//       pricePerDay: 200,
//     },
//     total: 1249.75,
//     gst: 100.0,
//     priority: "High Priority",
//     scheduled: "16 Jan 2024 at 14:000 PM",
//     duration: "30 Days",
//     currentMedication: "Paracetamol, Dolo, Ibuprofen",
//     medicalCondition: "Needs elderly care",
//     emergencyContact: {
//       name: "John Doe",
//       number: "+91 98765 43211",
//     },
//     assignedStaff: null,
//   },
//   {
//     id: "ORD-002",
//     bookingId: "BOOK952741",
//     date: "18 Jan 2024",
//     customer: {
//       name: "Priya Sharma",
//       location: "Koramangala, Bengaluru",
//       age: 45,
//       gender: "Female",
//       phone: "+91 98765 43212",
//       email: "priya.sharma@example.com",
//       address: "123 MG Road, Koramangala, Bengaluru - 560034",
//     },
//     status: "In Progress",
//     payment: "Paid",
//     service: "Physiotherapy Session",
//     serviceDetails: {
//       name: "Physiotherapy Session",
//       description: "Complete physiotherapy treatment",
//       pricePerDay: 300,
//     },
//     total: 2500.0,
//     gst: 210.5,
//     priority: "Medium Priority",
//     scheduled: "18 Jan 2024 at 10:00 AM",
//     duration: "7 Days",
//     currentMedication: "Pain relievers, Muscle relaxants",
//     medicalCondition: "Post-surgery rehabilitation",
//     emergencyContact: {
//       name: "Raj Sharma",
//       number: "+91 98765 43213",
//     },
//     assignedStaff: "Dr. Smith",
//   },
//   {
//     id: "ORD-003",
//     bookingId: "BOOK736198",
//     date: "21 Jan 2024",
//     customer: {
//       name: "Amit Patel",
//       location: "Sector 29, Gurugram",
//       age: 65,
//       gender: "Male",
//       phone: "+91 98765 43214",
//       email: "amit.patel@example.com",
//       address: "789 Golf Course Road, Sector 29, Gurugram - 122001",
//     },
//     status: "Completed",
//     payment: "Paid",
//     service: "Elderly Care",
//     serviceDetails: {
//       name: "Elderly Care",
//       description: "Complete elderly care services",
//       pricePerDay: 400,
//     },
//     total: 5800.25,
//     gst: 450.0,
//     priority: "Low Priority",
//     scheduled: "21 Jan 2024 at 09:00 AM",
//     duration: "14 Days",
//     currentMedication: "Blood pressure medication, Vitamins",
//     medicalCondition: "Hypertension, General weakness",
//     emergencyContact: {
//       name: "Rita Patel",
//       number: "+91 98765 43215",
//     },
//     assignedStaff: "Nurse Johnson",
//   },
//   {
//     id: "ORD-004",
//     bookingId: "BOOK109823",
//     date: "22 Jan 2024",
//     customer: {
//       name: "Sunita Rao",
//       location: "Jubilee Hills, Hyderabad",
//       age: 52,
//       gender: "Female",
//       phone: "+91 98765 43216",
//       email: "sunita.rao@example.com",
//       address: "456 Jubilee Hills, Hyderabad - 500033",
//     },
//     status: "Cancelled",
//     payment: "Refunded",
//     service: "Post-operative Care",
//     serviceDetails: {
//       name: "Post-operative Care",
//       description: "Post-surgery care and monitoring",
//       pricePerDay: 350,
//     },
//     total: 3150.5,
//     gst: 265.0,
//     priority: "High Priority",
//     scheduled: "22 Jan 2024 at 08:00 AM",
//     duration: "9 Days",
//     currentMedication: "Antibiotics, Pain medication",
//     medicalCondition: "Post-surgery recovery",
//     emergencyContact: {
//       name: "Kumar Rao",
//       number: "+91 98765 43217",
//     },
//     assignedStaff: null,
//   },
// ];
