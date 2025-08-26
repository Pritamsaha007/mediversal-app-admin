// export interface Service {
//   id: number;
//   name: string;
//   description: string;
//   category: string;
//   status: "Active" | "Inactive";
//   offerings: Array<{
//     id: string;
//     name: string;
//     description: string;
//     price: number;
//     duration: string;
//     features: string[];
//     staffRequirements: string[];
//     equipmentIncluded: string[];
//     status: "Excellent" | "Good" | "Available";
//   }>;
//   rating?: number;
//   reviewCount?: number;
// }

// export const SAMPLE_SERVICES: Service[] = [
//   {
//     id: 1,
//     name: "Nursing Care Services",
//     description: "Professional nursing care at home",
//     category: "Healthcare",
//     status: "Active",
//     rating: 4.6,
//     reviewCount: 420,
//     offerings: [
//       {
//         id: "1",
//         name: "Oxygen Concentrator",
//         description: "5L capacity, continuous oxygen supply",
//         price: 200,
//         duration: "day",
//         features: [
//           "5L capacity",
//           "Continuous flow",
//           "Low noise operation",
//           "Power backup support",
//           "24/7 technical support",
//         ],
//         staffRequirements: ["Medical Prescription"],
//         equipmentIncluded: ["Oxygen Concentrator", "Nasal Cannula", "Tubing"],
//         status: "Excellent",
//       },
//       {
//         id: "2",
//         name: "Hospital Bed",
//         description: "Fully electric with adjustable height and backrest",
//         price: 350,
//         duration: "day",
//         features: [
//           "Fully electric",
//           "Adjustable height",
//           "Adjustable backrest",
//           "Side rails included",
//         ],
//         staffRequirements: ["Medical Prescription"],
//         equipmentIncluded: ["Hospital Bed", "Mattress", "Side Rails"],
//         status: "Good",
//       },
//     ],
//   },
//   {
//     id: 2,
//     name: "Physiotherapy Services",
//     description: "Rehabilitation and physical therapy",
//     category: "Healthcare",
//     status: "Active",
//     rating: 4.3,
//     reviewCount: 285,
//     offerings: [
//       {
//         id: "3",
//         name: "Home Physiotherapy Session",
//         description: "Professional physiotherapy at your home",
//         price: 500,
//         duration: "session",
//         features: [
//           "Certified physiotherapist",
//           "Personalized treatment plan",
//           "Exercise guidance",
//           "Progress tracking",
//         ],
//         staffRequirements: ["Licensed Physiotherapist", "Medical History"],
//         equipmentIncluded: ["Therapy Equipment", "Exercise Materials"],
//         status: "Excellent",
//       },
//     ],
//   },
//   {
//     id: 3,
//     name: "Lab Testing Services",
//     description: "Comprehensive diagnostic testing",
//     category: "Diagnostics",
//     status: "Inactive",
//     rating: 4.1,
//     reviewCount: 156,
//     offerings: [],
//   },
//   {
//     id: 4,
//     name: "Medical Equipment Rental",
//     description: "Rent medical equipment for home care",
//     category: "Equipment",
//     status: "Active",
//     rating: 4.8,
//     reviewCount: 512,
//     offerings: [
//       {
//         id: "4",
//         name: "Wheelchair Rental",
//         description: "Standard manual wheelchair for mobility",
//         price: 100,
//         duration: "day",
//         features: [
//           "Lightweight frame",
//           "Comfortable padding",
//           "Easy folding",
//           "Adjustable footrests",
//         ],
//         staffRequirements: ["Valid ID"],
//         equipmentIncluded: ["Wheelchair", "Cushion", "Safety Belt"],
//         status: "Available",
//       },
//     ],
//   },
//   {
//     id: 5,
//     name: "Telemedicine Consultation",
//     description: "Online medical consultations",
//     category: "Consultation",
//     status: "Active",
//     rating: 4.4,
//     reviewCount: 342,
//     offerings: [],
//   },
// ];
