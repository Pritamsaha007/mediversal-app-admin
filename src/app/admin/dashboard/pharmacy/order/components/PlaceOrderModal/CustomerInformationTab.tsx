"use client";

import React, { useState } from "react";
import { useOrderStore } from "../../store/placeOrderStore";

const CustomerInformationTab: React.FC = () => {
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { customerInfo, updateCustomerInfo, validateCurrentTab } =
    useOrderStore();

  const handleInputChange = (field: string, value: string) => {
    updateCustomerInfo({ [field]: value });

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
      case "customerId":
        if (!value.trim()) {
          newErrors.customerId = "Customer ID is required";
        } else if (value.trim().length < 3) {
          newErrors.customerId = "Customer ID must be at least 3 characters";
        } else {
          delete newErrors.customerId;
        }
        break;

      case "name":
        if (!value.trim()) {
          newErrors.name = "Customer name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "age":
        if (!value.trim()) {
          newErrors.age = "Age is required";
        } else if (!/^\d+$/.test(value.trim())) {
          newErrors.age = "Age must be a number";
        } else if (parseInt(value) < 1 || parseInt(value) > 120) {
          newErrors.age = "Age must be between 1 and 120";
        } else {
          delete newErrors.age;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
          newErrors.phone = "Phone number must be 10 digits";
        } else {
          delete newErrors.phone;
        }
        break;

      case "email":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "gender":
        if (!value.trim()) {
          newErrors.gender = "Gender is required";
        } else {
          delete newErrors.gender;
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

  const getSelectClassName = (fieldName: string) => {
    const baseClass =
      "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 text-xs text-[#161D1F]";
    const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
    const normalClass =
      "border-[#E5E8E9] focus:border-[#0088B1] focus:ring-[#0088B1]";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Customer ID <RequiredStar />
            </label>
            <input
              type="text"
              placeholder="e.g., CUSTMO001352"
              value={customerInfo.customerId}
              onChange={(e) => handleInputChange("customerId", e.target.value)}
              onBlur={(e) => handleBlur("customerId", e.target.value)}
              className={getInputClassName("customerId")}
            />
            {errors.customerId && (
              <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Customer Name <RequiredStar />
            </label>
            <input
              type="text"
              placeholder="e.g., Rahul Kumar"
              value={customerInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              className={getInputClassName("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Age <RequiredStar />
            </label>
            <input
              type="text"
              placeholder="e.g., 27"
              value={customerInfo.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              onBlur={(e) => handleBlur("age", e.target.value)}
              className={getInputClassName("age")}
            />
            {errors.age && (
              <p className="text-red-500 text-xs mt-1">{errors.age}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Phone Number <RequiredStar />
            </label>
            <input
              type="tel"
              placeholder="e.g., 9876543210"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={(e) => handleBlur("phone", e.target.value)}
              className={getInputClassName("phone")}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g., customer@example.com"
              value={customerInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              className={getInputClassName("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Gender <RequiredStar />
            </label>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                handleInputChange("gender", e.target.value);
              }}
              onBlur={(e) => handleBlur("gender", e.target.value)}
              className={getSelectClassName("gender")}
            >
              <option value="" className="text-gray-400">
                Select Gender
              </option>
              <option value="male" className="text-[#161D1F]">
                Male
              </option>
              <option value="female" className="text-[#161D1F]">
                Female
              </option>
              <option value="other" className="text-[#161D1F]">
                Other
              </option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInformationTab;
