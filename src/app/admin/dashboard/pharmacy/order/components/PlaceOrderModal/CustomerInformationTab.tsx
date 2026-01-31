"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOrderStore } from "../../store/placeOrderStore";
import { ChevronDown, Search, Loader2, Mail, Phone } from "lucide-react";
import { Customer } from "@/app/admin/dashboard/customer/type/customerDetailTypes";
import CustomerService from "@/app/admin/dashboard/customer/services/customerService";

const CustomerInformationTab: React.FC = () => {
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { customerInfo, updateCustomerInfo, validateCurrentTab } =
    useOrderStore();
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

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

  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await CustomerService.searchCustomers(query, 0, 10);
      if (response.success) {
        setCustomers(response.customers || []);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      setCustomers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchCustomers(query);
    }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCustomers(query);
    }, 500);
  };

  const handleCustomerSelect = (customer: Customer) => {
    const fullName = CustomerService.getFullName(customer);

    updateCustomerInfo({
      customerId: customer.id || "",
      name: fullName,
      email: customer.email || "",
      phone: customer.phone_number || "",
    });

    setSearchQuery(fullName);
    setIsCustomerDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (customerInfo.customerId) {
      const fetchCustomerDetails = async () => {
        try {
          const response = await CustomerService.searchCustomers(
            customerInfo.customerId,
            0,
            1,
          );
          if (response.success && response.customers.length > 0) {
            const customer = response.customers[0];
            const fullName = CustomerService.getFullName(customer);
            setSearchQuery(fullName);
          }
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      };
      fetchCustomerDetails();
    }
  }, [customerInfo.customerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Search Customer
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                className={`${getInputClassName("customerId")} pr-10`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {isCustomerDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E8E9] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-3 text-xs text-gray-500 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="px-4 py-3 text-xs cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-[#161D1F]">
                        {CustomerService.getFullName(customer)}
                      </div>
                      <div className="text-gray-500 mt-1">
                        {customer.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone color="#0088b1" size={16} />
                            {customer.phone_number}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail color="#0088b1" size={16} />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                      {customer.id && (
                        <div className="text-gray-400 text-[10px] mt-1">
                          ID: {customer.id}
                        </div>
                      )}
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    No customers found
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    Start typing to search customers...
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Customer ID
            </label>
            <input
              type="text"
              placeholder="Auto-filled when customer is selected"
              value={customerInfo.customerId}
              readOnly
              className={`${getInputClassName("customerId")} bg-gray-50 cursor-not-allowed`}
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

          <div className="relative">
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Gender <RequiredStar />
            </label>

            <div
              tabIndex={0}
              onClick={() => setIsGenderOpen((prev) => !prev)}
              onBlur={() => {
                setIsGenderOpen(false);
                handleBlur("gender", customerInfo.gender);
              }}
              className={`${getSelectClassName(
                "gender",
              )} cursor-pointer flex justify-between items-center`}
            >
              <span
                className={
                  customerInfo.gender ? "text-[#161D1F]" : "text-gray-400"
                }
              >
                {customerInfo.gender
                  ? customerInfo.gender.charAt(0).toUpperCase() +
                    customerInfo.gender.slice(1)
                  : "Select Gender"}
              </span>

              <ChevronDown size={14} />
            </div>

            {isGenderOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E8E9] rounded-xl shadow-lg overflow-hidden">
                {["male", "female", "other"].map((option) => (
                  <div
                    key={option}
                    onMouseDown={() => {
                      handleInputChange("gender", option);
                      setIsGenderOpen(false);
                    }}
                    className="px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 text-black"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                ))}
              </div>
            )}

            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default CustomerInformationTab;
