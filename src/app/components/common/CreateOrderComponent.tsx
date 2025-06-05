// "use client";

// import type React from "react";

// import { useState } from "react";
// import {
//   Search,
//   Calendar,
//   ChevronDown,
//   Minus,
//   Plus,
//   ShoppingCart,
// } from "lucide-react";
// import Prod from "../../../../public/Mediversal Health Studio.svg";

// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   quantity: number;
// }

// interface CreateOrderProps {
//   onCancel: () => void;
//   onProceedToCheckout: () => void;
// }

// // Custom Button Component
// const Button = ({
//   children,
//   onClick,
//   variant = "primary",
//   size = "md",
//   className = "",
//   ...props
// }: {
//   children: React.ReactNode;
//   onClick?: () => void;
//   variant?: "primary" | "secondary" | "ghost";
//   size?: "sm" | "md" | "lg";
//   className?: string;
//   [key: string]: any;
// }) => {
//   const baseClasses =
//     "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

//   const variants = {
//     primary: "bg-[#0088B1] hover:bg-[#007197] text-white focus:ring-[#33BEE2]",
//     secondary:
//       "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#33BEE2]",
//     ghost:
//       "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-[#33BEE2]",
//   };

//   const sizes = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base",
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// // Custom Input Component
// const Input = ({
//   label,
//   placeholder,
//   value,
//   onChange,
//   type = "text",
//   required = false,
//   className = "",
//   ...props
// }: {
//   label?: string;
//   placeholder?: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   type?: string;
//   required?: boolean;
//   className?: string;
//   [key: string]: any;
// }) => {
//   return (
//     <div className="space-y-2">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
//       <input
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#33BEE2] focus:border-[#33BEE2] ${className}`}
//         {...props}
//       />
//     </div>
//   );
// };

// // Custom Select Component
// const Select = ({
//   label,
//   value,
//   onChange,
//   options,
//   placeholder = "Select an option",
//   className = "",
// }: {
//   label?: string;
//   value: string;
//   onChange: (value: string) => void;
//   options: { value: string; label: string }[];
//   placeholder?: string;
//   className?: string;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const selectedOption = options.find((option) => option.value === value);

//   return (
//     <div className="space-y-2">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setIsOpen(!isOpen)}
//           className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33BEE2] focus:border-teal-500 ${className}`}
//         >
//           <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
//             {selectedOption ? selectedOption.label : placeholder}
//           </span>
//           <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         </button>

//         {isOpen && (
//           <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
//             <div className="py-1">
//               {options.map((option) => (
//                 <button
//                   key={option.value}
//                   type="button"
//                   onClick={() => {
//                     onChange(option.value);
//                     setIsOpen(false);
//                   }}
//                   className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
//                     value === option.value
//                       ? "bg-teal-50 text-[#0088B1]"
//                       : "text-gray-900"
//                   }`}
//                 >
//                   {option.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default function CreateOrderComponent({
//   onCancel,
//   onProceedToCheckout,
// }: CreateOrderProps) {
//   const [activeTab, setActiveTab] = useState<"products" | "services">(
//     "products"
//   );
//   const [searchQuery, setSearchQuery] = useState("");
//   const [cartValue, setCartValue] = useState(0);
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupon, setAppliedCoupon] = useState<{
//     code: string;
//     discount: number;
//   } | null>({
//     code: "MEDIVERSE",
//     discount: 25,
//   });

//   // Form state
//   const [orderForm, setOrderForm] = useState({
//     orderId: "ORD-123456",
//     date: "05/12/2025",
//     recipientName: "",
//     mobileNumber: "",
//     houseNumber: "",
//     areaDetails: "",
//     pincode: "800004",
//     city: "Patna",
//     landmark: "",
//     state: "Bihar",
//     addressType: "home",
//   });

//   const [products, setProducts] = useState<Product[]>([
//     {
//       id: "1",
//       name: "Dolo 650mg Tablet",
//       description: "Strip of 10 Tablets",
//       price: 41,
//       originalPrice: 45.02,
//       image: "/placeholder.svg?height=60&width=60",
//       quantity: 1,
//     },
//     {
//       id: "2",
//       name: "Paracetamol 500mg Tablet",
//       description: "Strip of 15 Tablets",
//       price: 35,
//       originalPrice: 39.5,
//       image: "",
//       quantity: 2,
//     },
//     {
//       id: "3",
//       name: "Ibuprofen 400mg Tablet",
//       description: "Strip of 10 Tablets",
//       price: 50,
//       originalPrice: 54.75,
//       image: "/placeholder.svg?height=60&width=60",
//       quantity: 3,
//     },
//     {
//       id: "4",
//       name: "Aspirin 100mg Tablet",
//       description: "Strip of 20 Tablets",
//       price: 20,
//       originalPrice: 22.5,
//       image: "/placeholder.svg?height=60&width=60",
//       quantity: 4,
//     },
//     {
//       id: "5",
//       name: "Amoxicillin 500mg Capsule",
//       description: "Strip of 10 Capsules",
//       price: 90,
//       originalPrice: 95.0,
//       image: "/placeholder.svg?height=60&width=60",
//       quantity: 5,
//     },
//     {
//       id: "6",
//       name: "Cetirizine 10mg Tablet",
//       description: "Strip of 10 Tablets",
//       price: 30,
//       originalPrice: 32.0,
//       image: "/placeholder.svg?height=60&width=60",
//       quantity: 6,
//     },
//   ]);

//   const addressTypeOptions = [
//     { value: "home", label: "Home" },
//     { value: "office", label: "Office" },
//     { value: "other", label: "Other" },
//   ];

//   const updateQuantity = (productId: string, change: number) => {
//     setProducts((prev) =>
//       prev.map((product) => {
//         if (product.id === productId) {
//           const newQuantity = Math.max(0, product.quantity + change);
//           return { ...product, quantity: newQuantity };
//         }
//         return product;
//       })
//     );
//   };

//   const calculateCartValue = () => {
//     const total = products.reduce(
//       (sum, product) => sum + product.price * product.quantity,
//       0
//     );
//     return total;
//   };

//   const applyCoupon = () => {
//     if (couponCode.toUpperCase() === "MEDIVERSE") {
//       setAppliedCoupon({ code: "MEDIVERSE", discount: 25 });
//       setCouponCode("");
//     }
//   };

//   const removeCoupon = () => {
//     setAppliedCoupon(null);
//   };

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold text-gray-900">
//           Create New Order
//         </h1>

//         <div className="flex items-center gap-3">
//           <Button variant="secondary" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button onClick={onProceedToCheckout}>Proceed to Checkout</Button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Left Side - Form */}
//         <div className="space-y-6">
//           {/* Order Details */}
//           <div className="grid grid-cols-2 gap-4 text-[#899193]">
//             <Input
//               label="Order ID"
//               value={orderForm.orderId}
//               onChange={(e) =>
//                 setOrderForm({ ...orderForm, orderId: e.target.value })
//               }
//               disabled
//             />
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 Date
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={orderForm.date}
//                   onChange={(e) =>
//                     setOrderForm({ ...orderForm, date: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33BEE2] focus:border-[#0088B1"
//                 />
//                 <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               </div>
//             </div>
//           </div>

//           {/* Recipient Details */}
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Recipient Name"
//               placeholder="Recipient Name"
//               value={orderForm.recipientName}
//               onChange={(e) =>
//                 setOrderForm({ ...orderForm, recipientName: e.target.value })
//               }
//             />
//             <Input
//               label="Mobile Number"
//               placeholder="Mobile Number"
//               value={orderForm.mobileNumber}
//               onChange={(e) =>
//                 setOrderForm({ ...orderForm, mobileNumber: e.target.value })
//               }
//             />
//           </div>

//           {/* Address Details */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-medium text-gray-900">
//               Address Details
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <Input
//                 label="House/Floor/Flat Number"
//                 placeholder="House/Floor/Flat Number"
//                 value={orderForm.houseNumber}
//                 onChange={(e) =>
//                   setOrderForm({ ...orderForm, houseNumber: e.target.value })
//                 }
//                 required
//               />
//               <Input
//                 label="Area Details"
//                 placeholder="Area Details"
//                 value={orderForm.areaDetails}
//                 onChange={(e) =>
//                   setOrderForm({ ...orderForm, areaDetails: e.target.value })
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4 text-[#899193]">
//               <Input
//                 label="Pincode"
//                 placeholder="Pincode"
//                 value={orderForm.pincode}
//                 onChange={(e) =>
//                   setOrderForm({ ...orderForm, pincode: e.target.value })
//                 }
//               />
//               <Input
//                 label="City"
//                 placeholder="City"
//                 value={orderForm.city}
//                 onChange={(e) =>
//                   setOrderForm({ ...orderForm, city: e.target.value })
//                 }
//               />
//             </div>
//             <Input
//               label="Landmark"
//               placeholder="Landmark"
//               value={orderForm.landmark}
//               onChange={(e) =>
//                 setOrderForm({ ...orderForm, landmark: e.target.value })
//               }
//             />
//             <div className="grid grid-cols-2 gap-4 text-[#899193]">
//               <Input
//                 label="State"
//                 placeholder="State"
//                 value={orderForm.state}
//                 onChange={(e) =>
//                   setOrderForm({ ...orderForm, state: e.target.value })
//                 }
//               />
//               <Select
//                 label="Address Type"
//                 value={orderForm.addressType}
//                 onChange={(value) =>
//                   setOrderForm({ ...orderForm, addressType: value })
//                 }
//                 options={addressTypeOptions}
//               />
//             </div>
//           </div>

//           {/* Promotional Offers */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-medium text-gray-900">
//               Promotional Offers
//             </h3>
//             <div className="border border-gray-300 rounded-lg p-4">
//               <div className="flex items-center gap-2 mb-4">
//                 <Search className="h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Apply Coupons"
//                   value={couponCode}
//                   onChange={(e) => setCouponCode(e.target.value)}
//                   className="flex-1 border-none outline-none text-gray-600"
//                 />
//                 <Button size="sm" onClick={applyCoupon}>
//                   Apply
//                 </Button>
//               </div>

//               {appliedCoupon && (
//                 <div className="bg-[#0088B1] text-white rounded-lg p-4 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-white text-[#0088B1] rounded-full w-12 h-12 flex items-center justify-center font-bold">
//                       {appliedCoupon.discount}%
//                     </div>
//                     <div>
//                       <div className="font-semibold">{appliedCoupon.code}</div>
//                       <div className="text-sm opacity-90">
//                         By applying this coupon it will give{" "}
//                         {appliedCoupon.discount}% Discount
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={removeCoupon}
//                     className="text-white hover:bg-[#0088B1]"
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Products/Services */}
//         <div className="space-y-4">
//           {/* Tab Navigation and Cart Value */}
//           <div className="flex items-center justify-between border-b-2 border-[#0088B1] pb-1">
//             <div className="flex">
//               <button
//                 onClick={() => setActiveTab("products")}
//                 className={`px-6 py-2 rounded-t-lg font-medium ${
//                   activeTab === "products"
//                     ? "bg-[#0088B1] text-white"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 Products
//               </button>
//               <button
//                 onClick={() => setActiveTab("services")}
//                 className={`px-6 py-2 rounded-t-lg font-medium ${
//                   activeTab === "services"
//                     ? "bg-[#0088B1] text-white"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 Services
//               </button>
//             </div>
//             <div className="flex items-center gap-2 text-[#161D1F]">
//               <span>
//                 Cart Value:{" "}
//                 <span className="text-[#0088B1]">
//                   ₹{calculateCartValue().toFixed(2)}
//                 </span>
//               </span>
//               <ShoppingCart className="h-5 w-5" />
//             </div>
//           </div>

//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search product names"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border text-[#899193] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#33BEE2] focus:border-[#0088B1]"
//             />
//           </div>

//           {/* Products List */}
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {products
//               .filter((product) =>
//                 product.name.toLowerCase().includes(searchQuery.toLowerCase())
//               )
//               .map((product) => (
//                 <div
//                   key={product.id}
//                   className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
//                 >
//                   <img
//                     src={product.image || "/placeholder.svg"}
//                     alt={product.name}
//                     className="w-16 h-16 object-cover rounded-md bg-gray-100"
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-medium text-gray-900">
//                       {product.name}
//                     </h4>
//                     <p className="text-sm text-gray-600">
//                       {product.description}
//                     </p>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="text-lg font-semibold text-[#0088B1]">
//                         ₹{product.price}
//                       </span>
//                       {product.originalPrice && (
//                         <span className="text-sm text-gray-400 line-through">
//                           ₹{product.originalPrice}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => updateQuantity(product.id, -1)}
//                       className="w-8 h-8 rounded-full border border-[#0088B1] text-[#0088B1] flex items-center justify-center hover:bg-teal-50"
//                     >
//                       <Minus className="h-4 w-4" />
//                     </button>
//                     <span className="w-8 text-center font-medium text-[#899193]">
//                       {product.quantity}
//                     </span>
//                     <button
//                       onClick={() => updateQuantity(product.id, 1)}
//                       className="w-8 h-8 rounded-full border border-[#0088B1] text-[#0088B1] flex items-center justify-center hover:bg-teal-50"
//                     >
//                       <Plus className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
