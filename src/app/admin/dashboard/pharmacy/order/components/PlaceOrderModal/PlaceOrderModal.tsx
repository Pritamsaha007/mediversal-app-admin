"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import CustomerInformationTab from "./CustomerInformationTab";
import ShippingDetailsTab from "./ShippingDetailsTab";
import PrescriptionTab from "./PrescriptionTab";
import OrderItemsTab from "./OrderItemsTab";
import { useOrderStore } from "../../store/placeOrderStore";
import { useAdminStore } from "@/app/store/adminStore";
import { checkServiceability, createShiprocketOrder } from "../../services";
import { CreateOrderRequest, OrderItem } from "../../types/types";
import toast from "react-hot-toast";

interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("customer");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [tabErrors, setTabErrors] = useState<Record<string, string[]>>({});

  const {
    resetOrder,
    getOrderData,
    customerInfo,
    shippingInfo,
    orderItems,
    prescriptionUrls,
  } = useOrderStore();

  const { token } = useAdminStore();

  const tabs = [
    { id: "customer", label: "Customer Information" },
    { id: "shipping", label: "Shipping Details" },
    { id: "prescription", label: "Prescription" },
    { id: "items", label: "Order Items" },
  ];

  const handleClose = () => {
    resetOrder();
    setTabErrors({});
    onClose();
  };

  const handleReset = () => {
    resetOrder();
    setTabErrors({});
    setActiveTab("customer");
  };

  const validateCurrentStep = (): boolean => {
    let isValid = false;

    switch (activeTab) {
      case "customer":
        isValid = validateCustomerTab();
        break;
      case "shipping":
        isValid = validateShippingTab();
        break;
      case "items":
        isValid = validateItemsTab();
        break;
      default:
        isValid = true;
    }

    return isValid;
  };

  const validateCustomerTab = (): boolean => {
    const errors: string[] = [];

    if (!customerInfo.customerId.trim()) errors.push("Customer ID is required");
    if (!customerInfo.name.trim()) errors.push("Customer name is required");
    if (!customerInfo.age.trim()) errors.push("Age is required");
    if (!customerInfo.phone.trim()) errors.push("Phone number is required");
    if (!customerInfo.gender.trim()) errors.push("Gender is required");

    if (
      customerInfo.phone.trim() &&
      !/^\d{10}$/.test(customerInfo.phone.trim())
    ) {
      errors.push("Phone number must be 10 digits");
    }

    if (
      customerInfo.age.trim() &&
      (!/^\d+$/.test(customerInfo.age.trim()) ||
        parseInt(customerInfo.age) < 1 ||
        parseInt(customerInfo.age) > 120)
    ) {
      errors.push("Age must be a valid number between 1 and 120");
    }

    if (
      customerInfo.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())
    ) {
      errors.push("Please enter a valid email address");
    }

    setTabErrors((prev) => ({ ...prev, customer: errors }));
    return errors.length === 0;
  };

  const validateShippingTab = (): boolean => {
    const errors: string[] = [];

    if (!shippingInfo.addressLine1.trim())
      errors.push("Address line 1 is required");
    if (!shippingInfo.city.trim()) errors.push("City is required");
    if (!shippingInfo.state.trim()) errors.push("State is required");
    if (!shippingInfo.pincode.trim()) errors.push("PIN code is required");

    if (
      shippingInfo.pincode.trim() &&
      !/^\d{6}$/.test(shippingInfo.pincode.trim())
    ) {
      errors.push("PIN code must be 6 digits");
    }

    setTabErrors((prev) => ({ ...prev, shipping: errors }));
    return errors.length === 0;
  };

  const validateItemsTab = (): boolean => {
    const errors: string[] = [];

    if (orderItems.length === 0) {
      errors.push("At least one order item is required");
    }

    orderItems.forEach((item, index) => {
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Quantity must be at least 1`);
      }
      if (!item.sellingPrice || item.sellingPrice <= 0) {
        errors.push(`Item ${index + 1}: Selling price must be greater than 0`);
      }
    });

    setTabErrors((prev) => ({ ...prev, items: errors }));
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
        // Clear errors when moving to next tab
        setTabErrors((prev) => ({ ...prev, [activeTab]: [] }));
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleCreateOrder = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("No items in order");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const subtotal = orderItems.reduce(
        (total, item) =>
          total + Number(item.sellingPrice) * Number(item.quantity),
        0
      );
      const deliveryCharge = subtotal < 499 ? 40 : 0;
      const handlingPackagingFee = 5;
      const total = subtotal + deliveryCharge + handlingPackagingFee;

      const serviceabilityData = {
        pickup_postcode: "110001",
        delivery_postcode: shippingInfo.pincode,
        cod: 1,
        weight: 1,
      };

      const serviceabilityResponse = await checkServiceability(
        token,
        serviceabilityData
      );

      if (
        serviceabilityResponse.status === 200 &&
        serviceabilityResponse.data.available_courier_companies.length > 0
      ) {
        const shiprocketOrderData: CreateOrderRequest = {
          id: null,
          orderDate: new Date().toISOString(),
          comment: "Order from admin panel",
          customerId: customerInfo.customerId,
          billing_customer_name: customerInfo.name,
          billing_last_name: "",
          billing_address: shippingInfo.addressLine1 || "",
          billing_address_2: shippingInfo.addressLine2 || "",
          billing_city: shippingInfo.city,
          billing_pincode: shippingInfo.pincode,
          billing_state: shippingInfo.state,
          billing_country: "India",
          billing_phone: customerInfo.phone || "",
          billing_email: customerInfo.email || "",
          payment_status: "Pending",
          payment_method: "COD",
          payment_time: new Date().toISOString(),
          transaction_id: "",
          sub_total: subtotal,
          shipping_charges: deliveryCharge,
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: 0,
          delivery_status: "Processing",
          rapidshypShipmentId: null,
          rapidshypAwb: null,
          labelUrl: null,
          manifestUrl: null,
          coupon_id: null,
          applied_discount_value: null,
          prescription_url:
            prescriptionUrls.length > 0 ? prescriptionUrls[0] : null,
          cancellationReason: null,
          order_items:
            orderItems?.map((item: OrderItem) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity || 1,
              sellingPrice: item.sellingPrice,
              sku: item.sku || "SKU001",
              tax: item.tax || 0,
              discount: 0,
              hsn: 0,
              productLength: 10,
              productBreadth: 5,
              productHeight: 3,
              productWeight: 0.5,
            })) || [],
        };

        console.log("ShipRocket Order Data:", shiprocketOrderData);

        const isPatnaPincode = shippingInfo.pincode?.toString().startsWith("8");
        const isPatnaCity =
          shippingInfo.city?.toLowerCase().includes("patna") ||
          shippingInfo.city?.toLowerCase().includes("begusarai");

        let shiprocketResponse;

        if (isPatnaPincode || isPatnaCity) {
          shiprocketResponse = await createShiprocketOrder(
            token,
            false,
            shiprocketOrderData
          );
        } else {
          shiprocketResponse = await createShiprocketOrder(
            token,
            true,
            shiprocketOrderData
          );
        }

        console.log("ShipRocket Order Response:", shiprocketResponse);

        toast.success("Order created successfully!");
        resetOrder();
        setTabErrors({});
        onClose();
      } else {
        toast.error("Service not available for your location");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to complete order process");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const isLastTab = activeTab === "items";
  const isFirstTab = activeTab === "customer";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#161D1F]">
            Create New Order
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-xs font-medium transition-all duration-200 flex-1 max-w-[200px] mx-1 first:ml-0 last:mr-0 ${
                  activeTab === tab.id
                    ? "bg-[#0088B1] text-white rounded-t-lg border-b-2 border-[#0088B1]"
                    : "text-[#899193] bg-gray-50 rounded-t-lg border-b-2 border-transparent hover:text-[#161D1F] hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tabErrors[activeTab] && tabErrors[activeTab].length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {tabErrors[activeTab].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "customer" && <CustomerInformationTab />}
          {activeTab === "shipping" && <ShippingDetailsTab />}
          {activeTab === "prescription" && <PrescriptionTab />}
          {activeTab === "items" && <OrderItemsTab />}
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-sm text-[#161D1F] border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <div className="flex gap-3">
            {!isFirstTab && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 text-sm text-[#161D1F] border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            <button
              onClick={isLastTab ? handleCreateOrder : handleNext}
              disabled={
                isCreatingOrder || (isLastTab && orderItems.length === 0)
              }
              className="px-6 py-2 text-sm bg-[#0088B1] text-white rounded-lg hover:bg-[#0077A0] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreatingOrder
                ? "Creating..."
                : isLastTab
                ? "Create Order"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
