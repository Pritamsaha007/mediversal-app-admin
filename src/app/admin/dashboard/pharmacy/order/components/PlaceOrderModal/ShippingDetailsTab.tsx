"use client";

import React, { useState } from "react";
import { useOrderStore } from "../../store/placeOrderStore";
import { Check, ChevronDown, MapPin } from "lucide-react";

interface ShippingDetailsTabProps {
  isLocalDelivery?: boolean;
  onLocalDeliveryChange?: (isLocal: boolean) => void;
}

const ShippingDetailsTab: React.FC<ShippingDetailsTabProps> = ({
  isLocalDelivery = false,
  onLocalDeliveryChange,
}) => {
  const [addressType, setAddressType] = useState("home");
  const [state, setState] = useState("");
  const [isLocal, setIsLocal] = useState(isLocalDelivery);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { shippingInfo, updateShippingInfo } = useOrderStore();
  const [isCityOpen, setIsCityOpen] = useState(false);

  const localCities = ["Patna", "Begusarai"];

  const handleLocalDeliveryChange = (checked: boolean) => {
    setIsLocal(checked);

    if (checked && !shippingInfo.city) {
      updateShippingInfo({ city: "Patna" });
    }

    if (!checked && localCities.includes(shippingInfo.city)) {
      updateShippingInfo({ city: "" });
    }

    if (onLocalDeliveryChange) {
      onLocalDeliveryChange(checked);
    }
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

      <div className="mb-6 p-4 border border-[#E5E8E9] rounded-xl bg-gradient-to-r from-blue-50 to-gray-50 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              <div
                onClick={() => handleLocalDeliveryChange(!isLocal)}
                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200
      ${
        isLocal
          ? "bg-[#0088B1] border-[#0088B1]"
          : "border-[#0088B1] hover:bg-blue-50"
      }`}
              >
                {isLocal && <Check size={14} className="text-white" />}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#0088B1]" />
                <label
                  htmlFor="localDelivery"
                  className="text-sm font-semibold text-[#161D1F] cursor-pointer"
                >
                  Local Delivery Service
                </label>
                <span className="px-2 py-1 text-xs font-medium bg-[#0088B1] text-white rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Select for fast delivery within Patna & Begusarai. Enjoy
                same-day delivery, lower shipping costs, and dedicated local
                support.
              </p>
            </div>
          </div>
        </div>
      </div>

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
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-medium text-[#161D1F] mb-2">
                City/Town/Village <RequiredStar />
              </label>

              {isLocal ? (
                <>
                  <div
                    className={`${getInputClassName(
                      "city"
                    )} cursor-pointer flex justify-between items-center`}
                    onClick={() => setIsCityOpen((prev) => !prev)}
                    onBlur={() => handleBlur("city", shippingInfo.city)}
                    tabIndex={0}
                  >
                    <span
                      className={
                        shippingInfo.city ? "text-black" : "text-gray-400"
                      }
                    >
                      {shippingInfo.city || "Select City"}
                    </span>
                    <ChevronDown size={14} />
                  </div>

                  {isCityOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {localCities.map((city) => (
                        <div
                          key={city}
                          onClick={() => {
                            handleInputChange("city", city);
                            setIsCityOpen(false);
                          }}
                          className="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 text-black"
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  placeholder="e.g., Patna"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={(e) => handleBlur("city", e.target.value)}
                  className={getInputClassName("city")}
                />
              )}

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
