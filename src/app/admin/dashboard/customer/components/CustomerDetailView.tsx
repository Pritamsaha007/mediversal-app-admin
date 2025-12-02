"use client";
import React, { useEffect, useState } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, Activity } from "lucide-react";
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

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  onClose,
}) => {
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
        <h2 className="text-xl font-semibold text-[#161D1F]">
          Customer Details
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="h-full bg-gray-50 flex">
        {/* Left Sidebar - Customer Details */}
        <div className="w-96 bg-white h-full overflow-y-auto">
          <div className="p-6">
            {/* Customer Info Card */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#0088B1] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {customer.first_name?.charAt(0) || ""}
                  {customer.last_name?.charAt(0) || ""}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#161D1F]">
                    {CustomerService.getFullName(customer)}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                      customer.status?.toLowerCase() === "active"
                        ? "bg-[#34C759] text-white"
                        : "bg-[#EB5757] text-white"
                    }`}
                  >
                    {customer.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#0088B1]" />
                  <p className="text-xs text-[#899193]">Member Since</p>
                </div>
                <p className="text-sm font-semibold text-[#161D1F]">
                  {CustomerService.formatDate(customer.membership_date)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[#34C759]" />
                  <p className="text-xs text-[#899193]">Total Orders</p>
                </div>
                <p className="text-sm font-semibold text-[#161D1F]">
                  {customer.total_orders}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-xs text-[#899193] mb-2">Total Spent</p>
                <p className="text-lg font-semibold text-[#161D1F]">
                  {CustomerService.formatCurrency(customer.total_spent)}
                </p>
              </div>
            </div>

            {/* Basic Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#161D1F]">
                Basic Details
              </h4>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[#0088B1] mt-1" />
                <div>
                  <p className="text-xs text-[#899193]">Age & Gender</p>
                  <p className="text-sm text-[#161D1F]">
                    {CustomerService.formatAge(customer.age)} |{" "}
                    {customer.gender || "N/A"}
                  </p>
                </div>
              </div>

              {customer.birthday && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#0088B1] mt-1" />
                  <div>
                    <p className="text-xs text-[#899193]">Birthday</p>
                    <p className="text-sm text-[#161D1F]">
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

        {/* Right Side - Order History */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <CustomerOrderHistory
            orderData={orderData}
            loading={loading}
            customerName={CustomerService.getFullName(customer)}
          />
        </div>
      </div>
    </>
  );
};

export default CustomerDetailView;
