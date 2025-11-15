"use client";
import React, { useEffect, useState } from "react";
import { X, Search, Calendar, Clock, Trash2 } from "lucide-react";
import {
  getHomecareOfferings,
  getOrderStatus,
  createOrder,
  OrderStatusResponse,
} from "../services";
import { useAdminStore } from "../../../../../store/adminStore";
import { OfferingResponse } from "../types";

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedOffering {
  id: string;
  name: string;
  description: string;
  price: string;
  homecare_service_name: string;
}

interface BookingFormData {
  selectedOfferings: SelectedOffering[];
  patientName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  currentMedication: string;
  medicalCondition: string;
  completeAddress: string;
  startDate: string;
  startTime: string;
  orderStatus: string;
  estimatedDuration: string;
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentTab, setCurrentTab] = useState<
    "offerings" | "patient" | "address"
  >("offerings");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOfferings, setAvailableOfferings] = useState<
    OfferingResponse[]
  >([]);
  const [orderStatuses, setOrderStatuses] = useState<
    Array<{
      id: string;
      value: string;
      code: string;
      slno: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  const { token } = useAdminStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No token available");
        return;
      }

      try {
        setLoading(true);

        const [offeringsResponse, statusResponse] = await Promise.all([
          getHomecareOfferings({}, token),
          getOrderStatus(token),
        ]);

        setAvailableOfferings(offeringsResponse.offerings);
        setOrderStatuses(statusResponse.roles);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, token]);

  const [formData, setFormData] = useState<BookingFormData>({
    selectedOfferings: [],
    patientName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    currentMedication: "",
    medicalCondition: "",
    completeAddress: "",
    startDate: "",
    startTime: "",
    orderStatus: "",
    estimatedDuration: "",
  });

  const filteredOfferings = availableOfferings.filter(
    (offering) =>
      offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOfferingAdd = (offering: OfferingResponse) => {
    if (!formData.selectedOfferings.find((item) => item.id === offering.id)) {
      setFormData((prev) => ({
        ...prev,
        selectedOfferings: [...prev.selectedOfferings, offering],
      }));
    }
  };

  const handleOfferingRemove = (offeringId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedOfferings: prev.selectedOfferings.filter(
        (item) => item.id !== offeringId
      ),
    }));
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentTab === "offerings") {
      setCurrentTab("patient");
    } else if (currentTab === "patient") {
      setCurrentTab("address");
    }
  };

  const handleCreateOrder = async () => {
    if (!token) {
      alert("Authentication required. Please log in again.");
      return;
    }
    try {
      const orderTotal = formData.selectedOfferings
        .reduce((sum, offering) => sum + parseFloat(offering.price), 0)
        .toString();
      const orderPayload = {
        customer_id: "",
        homecare_service_offering_id: formData.selectedOfferings[0]?.id || "",
        order_total: orderTotal,
        order_status: formData.orderStatus,
        schedule_in_days: "1",
        schedule_in_hours: "24",
        order_details: {
          Patient_name: formData.patientName,
          Age: formData.age,
          "Medical Information": {
            "Medical Condition": formData.medicalCondition,
            "Current Medication": formData.currentMedication,
          },
          "Contact & Location": {
            "Service Address": formData.completeAddress,
            "Contact Person Name": formData.patientName,
            "Contact Number": formData.phoneNumber,
            "Emergency Contact": formData.emergencyContactNumber,
            "Date & Time": `${formData.startDate} ${formData.startTime}:00`,
            Email: formData.emailAddress || "",
          },
        },
      };

      const response = await createOrder(orderPayload, token);
      console.log("Order created:", response);
      alert("Order created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const renderTabButton = (tabKey: typeof currentTab, label: string) => (
    <button
      onClick={() => setCurrentTab(tabKey)}
      className={`flex-1 py-2 px-4 text-[10px] font-medium transition-colors ${
        currentTab === tabKey
          ? "bg-[#0088B1] text-[#F8F8F8]"
          : "bg-gray-100 text-[#161D1F] hover:bg-gray-200"
      } ${
        tabKey === "offerings"
          ? "rounded-lg"
          : tabKey === "address"
          ? "rounded-lg"
          : ""
      }`}
    >
      {label}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-[16px] font-medium text-[#161D1F]">
            Add New Booking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#899193] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {renderTabButton("offerings", "Offerings")}
            {renderTabButton("patient", "Patient & Health Details")}
            {renderTabButton("address", "Address & Schedule")}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentTab === "offerings" && (
            <div>
              {/* Added Offerings */}
              {formData.selectedOfferings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-semibold text-[#161D1F] mb-4">
                    Added Offerings
                  </h3>
                  <div className="space-y-3">
                    {formData.selectedOfferings.map((offering) => (
                      <div
                        key={offering.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div>
                          <h4 className="font-medium text-[12px] text-[#161D1F]">
                            {offering.name}
                          </h4>
                          <p className="text-[10px] text-[#899193]">
                            {offering.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#161D1F] text-[10px]">
                            ₹{offering.price}
                          </span>
                          <button
                            onClick={() => handleOfferingRemove(offering.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Offerings */}
              <div>
                <h3 className="text-[10px] font-semibold text-[#161D1F] mb-4">
                  Add Offerings <span className="text-red-500">*</span>
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search Offering..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent text-[#161d1f]"
                  />
                </div>

                {/* Available Offerings */}
                <div className="space-y-3">
                  {filteredOfferings.map((offering) => {
                    const isAdded = formData.selectedOfferings.find(
                      (item) => item.id === offering.id
                    );
                    return (
                      <div
                        key={offering.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-[12px] text-[#161D1F]">
                            {offering.name}
                          </h4>
                          <p className="text-[10px] text-[#899193]">
                            {offering.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#161D1F] text-[10px]">
                            ₹{offering.price}
                          </span>
                          <button
                            onClick={() => handleOfferingAdd(offering)}
                            disabled={!!isAdded}
                            className={`px-4 text-[10px] font-medium transition-colors ${
                              isAdded
                                ? " text-gray-400 cursor-not-allowed"
                                : " text-[#0088B1] cursor-pointer hover:text-cyan-700"
                            }`}
                          >
                            {isAdded ? "Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  disabled={formData.selectedOfferings.length === 0}
                  className={`px-8 py-2 rounded-lg text-white text-[10px] font-medium transition-colors ${
                    formData.selectedOfferings.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#0088B1] hover:bg-cyan-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentTab === "patient" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Name */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Patient Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name"
                    value={formData.patientName}
                    onChange={(e) =>
                      handleInputChange("patientName", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Age
                  </label>
                  <input
                    type="text"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={formData.emailAddress}
                    onChange={(e) =>
                      handleInputChange("emailAddress", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Emergency Contact Name */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Emergency Contact
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Emergency Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange("emergencyContactName", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Emergency Contact Number */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Emergency Contact
                    Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.emergencyContactNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactNumber",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Current Medication */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    Current Medication/Diagnosis{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter any medications ongoing with patient"
                    value={formData.currentMedication}
                    onChange={(e) =>
                      handleInputChange("currentMedication", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Medical Condition */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    Medical Condition <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe medical condition"
                    value={formData.medicalCondition}
                    onChange={(e) =>
                      handleInputChange("medicalCondition", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  className="px-8 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentTab === "address" && (
            <div>
              <div className="space-y-6">
                {/* Complete Address */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-2">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter complete address"
                    value={formData.completeAddress}
                    onChange={(e) =>
                      handleInputChange("completeAddress", e.target.value)
                    }
                    className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> Start Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          handleInputChange("startTime", e.target.value)
                        }
                        className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Priority Level */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> Status
                    </label>
                    <select
                      value={formData.orderStatus}
                      onChange={(e) =>
                        handleInputChange("orderStatus", e.target.value)
                      }
                      className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      {orderStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 7 days"
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        handleInputChange("estimatedDuration", e.target.value)
                      }
                      className="w-full px-4 py-2 border text-[10px] text-[#161D1F] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Create Order Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleCreateOrder}
                  className="px-8 py-2 text-[10px] bg-[#0088B1] text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  Create Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBookingModal;
