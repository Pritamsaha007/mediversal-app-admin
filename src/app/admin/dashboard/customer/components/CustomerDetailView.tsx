"use client";
import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  IdCard,
  Package,
  IndianRupee,
  ReceiptIndianRupee,
  ArrowLeft,
} from "lucide-react";
import { CustomerService } from "../services/customerService";
import CustomerOrderHistory from "./CustomerOrderHistory";
import {
  ConsultationOrder,
  HomecareOrder,
  LabTestBooking,
  PharmacyOrder,
  CustomerDetail,
} from "../type/customerDetailTypes";

interface CustomerDetailViewProps {
  customer: CustomerDetail;
  onClose: () => void;
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = React.memo(
  ({ customer, onClose }) => {
    const [orderData, setOrderData] = useState<{
      consultations: ConsultationOrder[];
      pharmacy: PharmacyOrder[];
      homecare: HomecareOrder[];
      labTests: LabTestBooking[];
    }>({
      consultations: [],
      pharmacy: [],
      homecare: [],
      labTests: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const data = await CustomerService.getAllCustomerOrders(customer.id);
          setOrderData(data);
        } catch (error) {
          console.error("Error fetching customer orders:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }, [customer.id]);

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>

            <h2 className="text-xl font-semibold text-[#161D1F]">
              User Management & Order Analytics
            </h2>
          </div>
        </div>

        <div className="h-full bg-gray-50 flex">
          <div className="w-96 bg-white border border-[#D3D7D8] rounded-xl h-full overflow-y-auto">
            <div className="p-6">
              <div className="mb-6 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#E8F4F7] text-[#161D1F] rounded-full flex items-center justify-center text-xl font-semibold">
                    {customer.first_name?.charAt(0) || ""}
                    {customer.last_name?.charAt(0) || ""}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#161D1F]">
                      {CustomerService.getFullName(customer)}
                    </h3>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-[#899193]" />
                        <span className="text-[#161D1F]">
                          {customer.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-[#899193]" />
                        <span className="text-[#161D1F]">
                          {customer.phone_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`absolute top-0 right-0 px-2 py-1 rounded text-[10px] font-medium ${
                      customer.status?.toLowerCase() === "active"
                        ? "bg-[#34C759] text-white"
                        : "bg-[#EB5757] text-white"
                    }`}
                  >
                    {customer.status || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-lg p-4 col-span-2 border border-[#D3D7D8] flex items-center">
                  <div className="flex items-start gap-2 flex-col">
                    <p className="text-[10px] text-[#899193]">Member Since</p>
                    <p className="text-sm font-semibold text-[#161D1F]">
                      {CustomerService.formatDate(customer.membership_date)}
                    </p>
                  </div>
                  <div className="items-center ml-auto p-2 bg-[#E8F4F7] rounded-full">
                    <IdCard className="w-4 h-4 text-[#0088B1]" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 col-span-2 border border-[#D3D7D8] flex items-center">
                  <div className="flex items-start gap-2 flex-col">
                    <p className="text-[10px] text-[#899193]">Total Orders</p>
                    <p className="text-sm font-semibold text-[#161D1F]">
                      {customer.total_orders}
                    </p>
                  </div>
                  <div className="items-center ml-auto p-2 bg-[#E8F4F7] rounded-full">
                    <Package className="w-4 h-4 text-[#0088B1]" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 col-span-2 border border-[#D3D7D8] flex items-center">
                  <div className="flex items-start gap-2 flex-col">
                    <p className="text-[10px] text-[#899193]">Total Spent</p>
                    <p className="text-sm font-semibold text-[#161D1F]">
                      {CustomerService.formatCurrency(customer.total_spent)}
                    </p>
                  </div>
                  <div className="items-center ml-auto p-2 bg-[#E8F4F7] rounded-full">
                    <ReceiptIndianRupee className="w-4 h-4 text-[#0088B1]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#161D1F]">
                  Basic Details
                </h4>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#E8F4F7] rounded-lg">
                    <User className="w-5 h-5 text-[#0088B1]" />
                  </div>

                  <div>
                    <p className="text-[10px] text-[#899193]">Age & Gender</p>
                    <p className="text-[10px] font-medium text-[#161D1F]">
                      {CustomerService.formatAge(customer.age)} |{" "}
                      {customer.gender || "N/A"}
                    </p>
                  </div>
                </div>

                {customer.birthday && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#E8F4F7] rounded-lg">
                      <Calendar className="w-5 h-5 text-[#0088B1]" />
                    </div>{" "}
                    <div>
                      <p className="text-[10px] text-[#899193]">Birthday</p>
                      <p className="text-[10px] font-medium text-[#161D1F]">
                        {CustomerService.formatDate(customer.birthday)}
                      </p>
                    </div>
                  </div>
                )}

                {(customer.city || customer.state || customer.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#0088B1] mt-1" />
                    <div>
                      <p className="text-xs text-[#899193]">Address</p>
                      <p className="text-sm text-[#161D1F]">
                        {[customer.city, customer.state, customer.country]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-y-auto border border-[#D3D7D8] rounded-xl ml-4">
            <CustomerOrderHistory
              orderData={orderData}
              loading={loading}
              customerName={CustomerService.getFullName(customer)}
            />
          </div>
        </div>
      </>
    );
  }
);

export default CustomerDetailView;
