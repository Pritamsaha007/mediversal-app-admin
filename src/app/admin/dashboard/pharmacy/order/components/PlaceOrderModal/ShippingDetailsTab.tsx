"use client";

import React, { useState } from "react";
import { useOrderStore } from "../../store/placeOrderStore";

const ShippingDetailsTab: React.FC = () => {
  const [addressType, setAddressType] = useState("home");
  const [state, setState] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { shippingInfo, updateShippingInfo } = useOrderStore();

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
                  "addressType"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#161D1F] mb-2">
                State <RequiredStar />
              </label>
              <input
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
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
              value="India"
              readOnly
              className="w-full px-4 py-3 border border-[#E5E8E9] rounded-xl bg-gray-50 text-xs text-[#161D1F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsTab;
