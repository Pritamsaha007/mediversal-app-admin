"use client";
import React, { useState, useEffect } from "react";
import { X, Upload, ChevronDown } from "lucide-react";

interface DeliveryRider {
  id: string;
  name: string;
  email: string;
  is_deleted: boolean;
  license_no: string;
  pin_code_id: string;
  joining_date: string;
  vehicle_name: string;
  aadhar_number: string;
  mobile_number: string;
  pin_code_value: string;
  service_city_id: string;
  vehicle_type_id: string;
  license_image_url: string;
  profile_image_url: string;
  service_city_name: string;
  is_available_status: "active" | "inactive";
  is_poi_verified_status: "approved" | "pending" | "rejected";
}

interface AddRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRider: (rider: DeliveryRider) => void;
  onUpdateRider: (rider: DeliveryRider) => void;
  editRider: DeliveryRider | null;
}

export const AddRiderModal: React.FC<AddRiderModalProps> = ({
  isOpen,
  onClose,
  onAddRider,
  onUpdateRider,
  editRider,
}) => {
  const [activeTab, setActiveTab] = useState<"basic" | "documents">("basic");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    aadhar_number: "",
    license_no: "",
    vehicle_name: "",
    service_city_name: "",
    pin_code_value: "",
    joining_date: new Date().toISOString().split("T")[0],
    is_available_status: "active" as "active" | "inactive",
  });

  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<string>("");

  const vehicleOptions = ["Motorcycle", "Scooter", "Car", "Bicycle"];
  const cityOptions = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Patna",
  ];

  useEffect(() => {
    if (editRider) {
      setFormData({
        name: editRider.name,
        email: editRider.email,
        mobile_number: editRider.mobile_number,
        aadhar_number: editRider.aadhar_number,
        license_no: editRider.license_no,
        vehicle_name: editRider.vehicle_name,
        service_city_name: editRider.service_city_name,
        pin_code_value: editRider.pin_code_value,
        joining_date: editRider.joining_date,
        is_available_status: editRider.is_available_status,
      });

      if (editRider.license_image_url)
        setLicensePreview(editRider.license_image_url);
      if (editRider.profile_image_url)
        setProfilePreview(editRider.profile_image_url);
    } else {
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        aadhar_number: "",
        license_no: "",
        vehicle_name: "",
        service_city_name: "",
        pin_code_value: "",
        joining_date: new Date().toISOString().split("T")[0],
        is_available_status: "active",
      });
      setLicensePreview("");
      setProfilePreview("");
      setLicenseImage(null);
      setProfileImage(null);
    }
  }, [editRider]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "license" | "profile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "license") {
        setLicenseImage(file);
        setLicensePreview(URL.createObjectURL(file));
      } else {
        setProfileImage(file);
        setProfilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const riderData: DeliveryRider = {
      id: editRider?.id || `rider-${Date.now()}`,
      ...formData,
      is_deleted: false,
      pin_code_id: editRider?.pin_code_id || `pin-${Date.now()}`,
      service_city_id: editRider?.service_city_id || `city-${Date.now()}`,
      vehicle_type_id: editRider?.vehicle_type_id || `vehicle-${Date.now()}`,
      license_image_url: licensePreview || editRider?.license_image_url || "",
      profile_image_url: profilePreview || editRider?.profile_image_url || "",
      is_poi_verified_status: "pending",
    };

    if (editRider) {
      onUpdateRider(riderData);
    } else {
      onAddRider(riderData);
    }

    onClose();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      mobile_number: "",
      aadhar_number: "",
      license_no: "",
      vehicle_name: "",
      service_city_name: "",
      pin_code_value: "",
      joining_date: new Date().toISOString().split("T")[0],
      is_available_status: "active",
    });
    setLicensePreview("");
    setProfilePreview("");
    setLicenseImage(null);
    setProfileImage(null);
  };

  if (!isOpen) return null;

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Email ID
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Phone Number
          </label>
          <input
            type="tel"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="+91 00000 00000"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Aadhaar Number
          </label>
          <input
            type="text"
            name="aadhar_number"
            value={formData.aadhar_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="1234-5678-9012"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Vehicle Type
          </label>
          <div className="relative">
            <select
              name="vehicle_name"
              value={formData.vehicle_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
              required
            >
              <option value="" className="text-gray-500">
                Select vehicle type
              </option>
              {vehicleOptions.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * License Number
          </label>
          <input
            type="text"
            name="license_no"
            value={formData.license_no}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="HR-26-2023-0045678"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Service City/Town
          </label>
          <div className="relative">
            <select
              name="service_city_name"
              value={formData.service_city_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
              required
            >
              <option value="" className="text-gray-500">
                Select service city
              </option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Service PIN Code
          </label>
          <input
            type="text"
            name="pin_code_value"
            value={formData.pin_code_value}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            placeholder="800023"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <>
      <div className="flex flex-row gap-6 mb-10">
        {/* Profile Photo */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#161D1F] mb-3">
            Profile Photo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0088B1] transition-colors h-full">
            {profilePreview ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-gray-200"
                />
                <p className="text-xs text-gray-600 mb-2">
                  {profileImage?.name || "rajesh_sharma.jpeg"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-2">
                  Drag and drop the image here or click to browse
                </p>
                <p className="text-[10px] text-gray-500 mb-3">
                  (supported file format .jpg, .jpeg, .png)
                </p>
              </div>
            )}

            <input
              type="file"
              onChange={(e) => handleFileChange(e, "profile")}
              className="hidden"
              id="profile-upload"
              accept="image/*"
            />
            <label
              htmlFor="profile-upload"
              className="inline-flex items-center px-4 py-2 bg-[#0088B1] text-white text-xs font-medium rounded-lg hover:bg-[#00729A] cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </label>
          </div>
        </div>

        {/* License Upload */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#161D1F] mb-3">
            Driving License
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0088B1] transition-colors h-full">
            {licensePreview ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={licensePreview}
                  alt="License preview"
                  className="w-32 h-20 object-contain mb-3 border border-gray-200 rounded"
                />
                <p className="text-xs text-gray-600 mb-2">
                  {licenseImage?.name || "driving_license.jpg"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-2">
                  Drag and drop a clear photo of the driver's license
                </p>
                <p className="text-[10px] text-gray-500 mb-3">
                  (supported file format .jpg, .jpeg, .png)
                </p>
              </div>
            )}

            <input
              type="file"
              onChange={(e) => handleFileChange(e, "license")}
              className="hidden"
              id="license-upload"
              accept="image/*,.pdf"
            />
            <label
              htmlFor="license-upload"
              className="inline-flex items-center px-4 py-2 bg-[#0088B1] text-white text-xs font-medium rounded-lg hover:bg-[#00729A] cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
        <input
          type="checkbox"
          checked={formData.is_available_status === "active"}
          onChange={(e) =>
            setFormData({
              ...formData,
              is_available_status: e.target.checked ? "active" : "inactive",
            })
          }
          className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
        />
        <div>
          <div className="text-xs font-medium text-[#161D1F]">Active Rider</div>
          <div className="text-[10px] text-gray-500">
            Inactive riders are not currently in service
          </div>
        </div>
      </div>
    </>
  );
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {editRider ? "Edit Rider Details" : "Add New Rider"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "basic"
                ? "bg-[#0088B1] text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "documents"
                ? "bg-[#0088B1] text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === "basic" && renderBasicInformation()}
          {activeTab === "documents" && renderDocuments()}
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          <div className="flex gap-3">
            {activeTab === "documents" && (
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}

            {activeTab === "basic" ? (
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors"
              >
                {editRider ? "Update Rider" : "Add Rider"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
