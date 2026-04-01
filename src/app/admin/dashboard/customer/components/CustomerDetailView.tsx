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
  ShoppingCart,
  Plus,
} from "lucide-react";
import { CustomerService } from "../services/customerService";
import CustomerOrderHistory from "./CustomerOrderHistory";
import {
  ConsultationOrder,
  HomecareOrder,
  LabTestBooking,
  PharmacyOrder,
  CustomerDetail,
  CartData,
} from "../type/customerDetailTypes";
import CartItemsList from "./CartItemsList";
import AddProductsModal from "./AddProductsModal";
import { useAdminStore } from "@/app/store/adminStore";

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
    const [cartItems, setCartItems] = useState<CartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState<string | null>(null);
    const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false);
    const { token } = useAdminStore();

    // Define refreshCart before using it in useEffect
    const refreshCart = async () => {
      if (!token) {
        console.warn("No auth token available for cart fetch");
        return;
      }

      setCartLoading(true);
      setCartError(null);
      try {
        const customerService = new CustomerService();
        const cartData = await customerService.getCartItems(customer.id, token);
        if (Array.isArray(cartData)) {
          setCartItems(cartData);
        } else if (cartData && typeof cartData === "object") {
          setCartItems([cartData]);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error refreshing cart:", error);
        setCartError("Failed to load cart items");
      } finally {
        setCartLoading(false);
      }
    };

    // Fetch orders on component mount
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

    // Fetch cart items when customer ID or token changes
    useEffect(() => {
      if (customer.id && token) {
        refreshCart();
      }
    }, [customer.id, token]);

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
                    </div>
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

              <div className="mb-6 mt-10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#161D1F] flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#0088B1]" />
                    Current Cart
                  </h4>
                  <button
                    onClick={() => setIsAddProductsModalOpen(true)}
                    className="px-2.5 py-1.5 bg-[#0088B1] text-white text-xs rounded-lg hover:bg-[#006A8A] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Items
                  </button>
                </div>

                <CartItemsList
                  cartItems={cartItems}
                  customerId={customer.id}
                  onCartUpdate={refreshCart}
                  loading={cartLoading}
                  error={cartError}
                />
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

        <AddProductsModal
          isOpen={isAddProductsModalOpen}
          onClose={() => setIsAddProductsModalOpen(false)}
          customerId={customer.id}
          customerName={CustomerService.getFullName(customer)}
          onProductsAdded={refreshCart}
        />
      </>
    );
  },
);

export default CustomerDetailView;
