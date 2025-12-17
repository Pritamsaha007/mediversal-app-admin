"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { NotificationFormData, EnumItem, Customer } from "../types/types";
import { searchCustomers } from "../services/service";
import DropdownSelector from "@/app/components/ui/DropdownSelector";

interface BasicInformationTabProps {
  formData: NotificationFormData;
  updateFormData: (data: Partial<NotificationFormData>) => void;
  userGroups: EnumItem[];
  token: string;
}

const BasicInformationTab: React.FC<BasicInformationTabProps> = ({
  formData,
  updateFormData,
  userGroups,
  token,
}) => {
  const [targetType, setTargetType] = useState<"group" | "individual">("group");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [userGroupDropdownOpen, setUserGroupDropdownOpen] = useState(false);
  const [displayedCustomers, setDisplayedCustomers] = useState<Customer[]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCustomerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreCustomers) {
          loadMoreCustomers();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMoreCustomers]
  );

  useEffect(() => {
    if (targetType === "individual" && !customerSearch) {
      loadInitialCustomers();
    }
  }, [targetType]);

  const loadInitialCustomers = async () => {
    try {
      const response = await searchCustomers("", 0, 50, token);
      if (response.success) {
        setDisplayedCustomers(response.customers);
        setHasMoreCustomers(response.customers.length === 50);
        setCustomerPage(1);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadMoreCustomers = async () => {
    if (loadingMore || !hasMoreCustomers) return;

    setLoadingMore(true);
    try {
      const response = await searchCustomers("", customerPage * 50, 50, token);
      if (response.success) {
        setDisplayedCustomers((prev) => [...prev, ...response.customers]);
        setHasMoreCustomers(response.customers.length === 50);
        setCustomerPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more customers:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (customerSearch && targetType === "individual") {
        handleCustomerSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [customerSearch]);

  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) return;

    setSearchLoading(true);
    try {
      const response = await searchCustomers(customerSearch, 0, 20, token);
      if (response.success) {
        setCustomers(response.customers);
        setShowCustomerDropdown(true);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    updateFormData({
      selectedCustomer: customer,
      targetUserGroupId: "",
      targetUserGroup: "",
    });
    setShowCustomerDropdown(false);
    setCustomerSearch("");
  };

  const handleRemoveCustomer = () => {
    updateFormData({ selectedCustomer: null });
  };

  const handleTargetTypeChange = (type: "group" | "individual") => {
    setTargetType(type);
    if (type === "group") {
      updateFormData({ selectedCustomer: null });
    } else {
      updateFormData({ targetUserGroupId: "", targetUserGroup: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          <span className="text-red-500">*</span> Title
        </label>
        <input
          type="text"
          placeholder="Please provide a suitable notification title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          className="w-full px-4 py-2 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          <span className="text-red-500">*</span> Message
        </label>
        <textarea
          placeholder="Brief about the title/offers"
          value={formData.message}
          onChange={(e) => updateFormData({ message: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] resize-none"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          <span className="text-red-500">*</span> Target Users
        </label>

        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={targetType === "group"}
              onChange={() => handleTargetTypeChange("group")}
              className="w-4 h-4 accent-[#0088B1] cursor-pointer"
            />

            <span className="text-[12px] text-[#161D1F]">User Group</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={targetType === "individual"}
              onChange={() => handleTargetTypeChange("individual")}
              className="w-4 h-4 accent-[#0088B1] cursor-pointer"
            />

            <span className="text-[12px] text-[#161D1F]">Individual User</span>
          </label>
        </div>

        {targetType === "group" ? (
          <DropdownSelector
            label=""
            options={userGroups.map((g) => g.value)}
            selected={formData.targetUserGroup}
            placeholder="Select your preferred users"
            open={userGroupDropdownOpen}
            toggleOpen={() => setUserGroupDropdownOpen(!userGroupDropdownOpen)}
            onSelect={(value) => {
              const selected = userGroups.find((g) => g.value === value);
              if (selected) {
                updateFormData({
                  targetUserGroup: selected.value,
                  targetUserGroupId: selected.id,
                });
              }
            }}
          />
        ) : (
          <div>
            {formData.selectedCustomer ? (
              <div className="flex items-center justify-between px-4 py-2 bg-[#E8F4F7] border border-[#0088B1] rounded-lg">
                <div>
                  <div className="text-[12px] font-medium text-[#161D1F]">
                    {formData.selectedCustomer.first_name}{" "}
                    {formData.selectedCustomer.last_name}
                  </div>
                  <div className="text-[10px] text-[#899193]">
                    {formData.selectedCustomer.city},{" "}
                    {formData.selectedCustomer.state}
                  </div>
                </div>
                <button
                  onClick={handleRemoveCustomer}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer by name..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="text-[12px] font-medium text-[#161D1F]">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-[10px] text-[#899193]">
                          {customer.city} {customer.state}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#FFFBEA] border border-[#F59E0B] rounded-lg p-4">
        <div className="flex gap-2">
          <span className="text-[#F59E0B] text-lg">💡</span>
          <div>
            <div className="text-[12px] font-medium text-[#F59E0B] mb-1">
              Preview updates in real-time as you type
            </div>
            <div className="text-[10px] text-[#92400E]">
              As you enter the notification title, message, & upload image, get
              a real-time preview of how it will show up on users' phone. Refine
              instantly to ensure clarity and impact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationTab;
