"use client";

import React, { useState, useEffect, useRef } from "react";
import { useOrderStore } from "../../store/placeOrderStore";
import { useAdminStore } from "@/app/store/adminStore";
import { ChevronDown, Phone } from "lucide-react";
import axios from "axios";
import CustomerAddress from "../../types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCustomerAddresses = async (
  customerId: string,
  token: string | undefined,
) => {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/customer/address/${customerId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.addresses;
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    throw error;
  }
};

const ShippingDetailsTab = () => {
  const [addressType, setAddressType] = useState("home");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { shippingInfo, updateShippingInfo, customerInfo } = useOrderStore();

  const { token } = useAdminStore();

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>(
    [],
  );
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCustomerAddresses = async () => {
      if (!customerInfo.customerId || !token) {
        setCustomerAddresses([]);
        return;
      }

      setIsLoadingAddresses(true);
      try {
        const data = await getCustomerAddresses(customerInfo.customerId, token);

        if (Array.isArray(data)) {
          setCustomerAddresses(data);
        } else if (data && data && Array.isArray(data)) {
          setCustomerAddresses(data);
        } else {
          setCustomerAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching customer addresses:", error);
        setCustomerAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchCustomerAddresses();
  }, [customerInfo.customerId, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddressDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fillAddressForm = (address: CustomerAddress) => {
    const addressLine1 = [
      address.Home_Floor_FlatNumber?.trim(),
      address.Area_details?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    updateShippingInfo({
      addressLine1: addressLine1 || address.Address || "",
      addressLine2: address.Address || "",
      landmark: address.LandMark || "",
      city: address.City?.trim() || "",
      state: address.State?.trim() || "",
      pincode: address.PinCode?.toString() || "",
      country: address.Country?.trim() || "India",
      addressType: address.Address_type?.toLowerCase() || "home",
    });

    setAddressType(address.Address_type?.toLowerCase() || "home");
  };

  const handleInputChange = (field: string, value: string) => {
    updateShippingInfo({ [field]: value });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "addressLine1":
        if (!value.trim()) {
          newErrors.addressLine1 = "Address line 1 is required";
        } else if (value.trim().length < 5) {
          newErrors.addressLine1 = "Address must be at least 5 characters";
        } else {
          delete newErrors.addressLine1;
        }
        break;

      case "city":
        if (!value.trim()) {
          newErrors.city = "City is required";
        } else if (value.trim().length < 2) {
          newErrors.city = "City must be at least 2 characters";
        } else {
          delete newErrors.city;
        }
        break;

      case "state":
        if (!value.trim()) {
          newErrors.state = "State is required";
        } else if (value.trim().length < 2) {
          newErrors.state = "State must be at least 2 characters";
        } else {
          delete newErrors.state;
        }
        break;

      case "pincode":
        if (!value.trim()) {
          newErrors.pincode = "PIN code is required";
        } else if (!/^\d{6}$/.test(value.trim())) {
          newErrors.pincode = "PIN code must be 6 digits";
        } else {
          delete newErrors.pincode;
        }
        break;

      case "addressType":
        if (!value.trim()) {
          newErrors.addressType = "Address type is required";
        } else {
          delete newErrors.addressType;
        }
        break;
    }

    setErrors(newErrors);
  };

  const getAddressDisplayText = (address: CustomerAddress) => {
    const addressLine1 = [
      address.Home_Floor_FlatNumber?.trim(),
      address.Area_details?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const parts = [
      addressLine1 || address.Address,
      address.LandMark?.trim(),
      `${address.City?.trim()}, ${address.State?.trim()} - ${address.PinCode}`,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getAddressTypeDisplay = (type: string) => {
    if (!type) return "Address";

    const typeMap: Record<string, string> = {
      home: "Home",
      work: "Work",
      office: "Work",
      other: "Other",
      Home: "Home",
      Work: "Work",
      Office: "Work",
      Other: "Other",
    };

    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const RequiredStar = () => <span className="text-red-500">*</span>;

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 text-xs placeholder:text-gray-400 text-[#161D1F]";
    const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
    const normalClass =
      "border-[#E5E8E9] focus:border-[#0088B1] focus:ring-[#0088B1]";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  const getRadioClassName = (fieldName: string) => {
    return errors[fieldName] ? "text-red-500" : "text-[#161D1F]";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-[#161D1F]">Shipping Addresses</h3>

      {customerInfo.customerId && (
        <div className="relative" ref={addressDropdownRef}>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Select Saved Address
          </label>
          <div
            className={`${getInputClassName("addressLine1")} cursor-pointer flex justify-between items-center`}
            onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
            tabIndex={0}
          >
            <span className="text-[#161D1F]">
              {isLoadingAddresses
                ? "Loading addresses..."
                : customerAddresses.length > 0
                  ? "Select a saved address"
                  : "No saved addresses found"}
            </span>
            {customerAddresses.length > 0 && <ChevronDown size={14} />}
          </div>

          {isAddressDropdownOpen && customerAddresses.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E8E9] rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {customerAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => {
                    fillAddressForm(address);
                    setIsAddressDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-xs cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="font-medium text-[#161D1F] mb-1">
                    {getAddressTypeDisplay(address.Address_type)} Address
                    {address.Recipient_name && (
                      <span className="ml-2 text-gray-600">
                        ({address.Recipient_name})
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {getAddressDisplayText(address)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-3">
          Address Type <RequiredStar />
        </label>
        <div className="flex gap-4">
          {["home", "work", "other"].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="addressType"
                value={type}
                checked={addressType === type}
                onChange={(e) => {
                  setAddressType(e.target.value);
                  handleInputChange("addressType", e.target.value);
                }}
                onBlur={(e) => handleBlur("addressType", e.target.value)}
                className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300"
              />
              <span
                className={`ml-2 text-xs capitalize ${getRadioClassName(
                  "addressType",
                )}`}
              >
                {type}
              </span>
            </label>
          ))}
        </div>
        {errors.addressType && (
          <p className="text-red-500 text-xs mt-1">{errors.addressType}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Address Line 1 <RequiredStar />
            </label>
            <input
              type="text"
              placeholder="Flat/House No., Building Name, Street"
              value={shippingInfo.addressLine1}
              onChange={(e) =>
                handleInputChange("addressLine1", e.target.value)
              }
              onBlur={(e) => handleBlur("addressLine1", e.target.value)}
              className={getInputClassName("addressLine1")}
            />
            {errors.addressLine1 && (
              <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              placeholder="Area, Colony, Sector"
              value={shippingInfo.addressLine2}
              onChange={(e) =>
                handleInputChange("addressLine2", e.target.value)
              }
              className={getInputClassName("addressLine2")}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Landmark
            </label>
            <input
              type="text"
              placeholder="Near Railway Station, Temple, etc."
              value={shippingInfo.landmark}
              onChange={(e) => handleInputChange("landmark", e.target.value)}
              className={getInputClassName("landmark")}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#161D1F] mb-2">
                City/Town/Village <RequiredStar />
              </label>
              <input
                type="text"
                placeholder="e.g., Patna"
                value={shippingInfo.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                onBlur={(e) => handleBlur("city", e.target.value)}
                className={getInputClassName("city")}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#161D1F] mb-2">
                State <RequiredStar />
              </label>
              <input
                value={shippingInfo.state}
                onChange={(e) => {
                  handleInputChange("state", e.target.value);
                }}
                onBlur={(e) => handleBlur("state", e.target.value)}
                placeholder="e.g., Bihar"
                className={getInputClassName("state")}
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#161D1F] mb-2">
                PIN Code <RequiredStar />
              </label>
              <input
                type="text"
                placeholder="6-digit PIN Code"
                value={shippingInfo.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                onBlur={(e) => handleBlur("pincode", e.target.value)}
                className={getInputClassName("pincode")}
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Country
            </label>
            <input
              type="text"
              value={shippingInfo.country || "India"}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E8E9] rounded-xl focus:outline-none focus:ring-1 focus:border-[#0088B1] focus:ring-[#0088B1] text-xs text-[#161D1F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsTab;
