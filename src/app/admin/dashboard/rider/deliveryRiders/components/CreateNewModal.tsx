"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, ChevronDown, Search, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminStore } from "@/app/store/adminStore";
import { CreateRiderPayload, DeliveryRider, Pincode } from "../../types";
import { uploadFile } from "../../../lab_tests/services";
import {
  createRider,
  updateRider,
  fetchServiceCities,
  searchPincodes,
  fetchVehicles,
} from "../../services";

interface AddRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRider: DeliveryRider | null;
}

export const AddRiderModal: React.FC<AddRiderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editRider,
}) => {
  const [activeTab, setActiveTab] = useState<"basic" | "documents">("basic");
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);
  const [fetchingPincodes, setFetchingPincodes] = useState(false);
  const [searchPincodeQuery, setSearchPincodeQuery] = useState("");
  const [showPincodeDropdown, setShowPincodeDropdown] = useState(false);

  const pincodeDropdownRef = useRef<HTMLDivElement>(null);
  const pincodeSearchRef = useRef<HTMLDivElement>(null);

  const [serviceCities, setServiceCities] = useState<any[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);
  const [availablePincodes, setAvailablePincodes] = useState<Pincode[]>([]);
  const [selectedPincodes, setSelectedPincodes] = useState<Pincode[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    aadhar_number: "",
    license_no: "",
    vehicle_type_id: "",
    service_city: "",
    pin_code: [] as string[],
    joining_date: new Date().toISOString().split("T")[0],
    is_available: true,
    is_POI_verified: false,
  });

  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<string>("");

  const { token } = useAdminStore();

  // Fetch service cities and vehicles on mount
  useEffect(() => {
    if (isOpen && token) {
      loadServiceCities();
      loadVehicleOptions();
    }
  }, [isOpen, token]);

  // IMPORTANT: This useEffect should populate form when editRider changes
  useEffect(() => {
    if (editRider && isOpen) {
      console.log("Editing rider data:", editRider); // Debug log

      // Set form data from editRider
      setFormData({
        name: editRider.name || "",
        email: editRider.email || "",
        mobile_number: editRider.mobile_number || "",
        aadhar_number: editRider.aadhar_number || "",
        license_no: editRider.license_no || "",
        vehicle_type_id: editRider.vehicle_type_id || "",
        service_city: editRider.service_city_id || "",
        pin_code: editRider.pin_codes || [],
        joining_date:
          editRider.joining_date || new Date().toISOString().split("T")[0],
        is_available: editRider.is_available_status === "active",
        is_POI_verified: editRider.is_poi_verified_status === "approved",
      });

      if (editRider.license_image_url) {
        setLicensePreview(editRider.license_image_url);
      }
      if (editRider.profile_image_url) {
        setProfilePreview(editRider.profile_image_url);
      }

      if (editRider.pin_codes && editRider.pin_codes.length > 0) {
        const pincodeObjects: Pincode[] = editRider.pin_codes.map(
          (pincodeStr: string, index: number) => ({
            id: `edit-${index}-${pincodeStr}`,
            pincode: pincodeStr,
            district: "",
            state: "",
            city_id: editRider.service_city_id || "",
          })
        );
        setSelectedPincodes(pincodeObjects);
      }
    } else {
      resetForm();
    }
  }, [editRider, isOpen]);

  useEffect(() => {
    if (formData.service_city && token) {
      loadPincodesByCity(formData.service_city);
    }
  }, [formData.service_city, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showPincodeDropdown &&
        pincodeDropdownRef.current &&
        pincodeSearchRef.current &&
        !pincodeDropdownRef.current.contains(event.target as Node) &&
        !pincodeSearchRef.current.contains(event.target as Node)
      ) {
        setShowPincodeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPincodeDropdown]);

  const loadServiceCities = async () => {
    if (!token) return;

    setFetchingCities(true);
    try {
      const response = await fetchServiceCities(token);
      if (response.success) {
        setServiceCities(response.roles || []);
      } else {
        toast.error("Failed to load service cities");
      }
    } catch (error: any) {
      console.error("Error fetching service cities:", error);
      toast.error(error.message || "Failed to load service cities");
    } finally {
      setFetchingCities(false);
    }
  };

  const loadVehicleOptions = async () => {
    if (!token) return;

    setFetchingVehicles(true);
    try {
      const response = await fetchVehicles(token);
      if (response.success) {
        setVehicleOptions(response.roles || []);
      } else {
        toast.error("Failed to load vehicle types");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle types:", error);
      toast.error(error.message || "Failed to load vehicle types");
    } finally {
      setFetchingVehicles(false);
    }
  };

  const loadPincodesByCity = async (cityId: string, search?: string) => {
    if (!token) return;

    setFetchingPincodes(true);
    try {
      const city = serviceCities.find((c) => c.id === cityId);
      const cityName = city?.value || "";

      const payload = {
        search_city: cityName,
        search_pincode: search,
        start: 0,
        max: 50,
      };

      const response = await searchPincodes(payload, token);
      if (response.success) {
        setAvailablePincodes(response.pincodes || []);

        if (response.pincodes && response.pincodes.length > 0) {
          setShowPincodeDropdown(true);
        }
      } else {
        toast.error("Failed to load pincodes");
      }
    } catch (error: any) {
      console.error("Error fetching pincodes:", error);
      toast.error(error.message || "Failed to load pincodes");
    } finally {
      setFetchingPincodes(false);
    }
  };

  const handlePincodeSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchPincodeQuery(value);
    if (value.trim()) {
      loadPincodesByCity(formData.service_city, value);
    } else {
      loadPincodesByCity(formData.service_city);
    }
  };

  const handlePincodeSelect = (pincode: Pincode) => {
    const isSelected = selectedPincodes.some((p) => p.id === pincode.id);

    if (!isSelected) {
      const updatedSelected = [...selectedPincodes, pincode];
      setSelectedPincodes(updatedSelected);
      setFormData((prev) => ({
        ...prev,
        pin_code: updatedSelected.map((p) => p.pincode),
      }));
    }

    setShowPincodeDropdown(false);
  };

  const handleRemovePincode = (pincodeId: string) => {
    const updatedSelected = selectedPincodes.filter((p) => p.id !== pincodeId);
    setSelectedPincodes(updatedSelected);
    setFormData((prev) => ({
      ...prev,
      pin_code: updatedSelected.map((p) => p.pincode),
    }));
  };

  const handleClearAllPincodes = () => {
    setSelectedPincodes([]);
    setFormData((prev) => ({
      ...prev,
      pin_code: [],
    }));
  };

  const handleSearchAreaClick = () => {
    if (formData.service_city) {
      setShowPincodeDropdown(true);
      const searchInput = document.getElementById("pincode-search-input");
      if (searchInput) {
        (searchInput as HTMLInputElement).focus();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile_number: "",
      aadhar_number: "",
      license_no: "",
      vehicle_type_id: "",
      service_city: "",
      pin_code: [],
      joining_date: new Date().toISOString().split("T")[0],
      is_available: true,
      is_POI_verified: false,
    });
    setLicensePreview("");
    setProfilePreview("");
    setLicenseImage(null);
    setProfileImage(null);
    setSelectedPincodes([]);
    setAvailablePincodes([]);
    setSearchPincodeQuery("");
    setShowPincodeDropdown(false);
  };

  const uploadImageToServer = async (
    file: File,
    folder: string
  ): Promise<string> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB.");
      }

      const fileUri = URL.createObjectURL(file);
      const fileContent = await fileToBase64(fileUri);

      const bucketName =
        (process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
          : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD) || "mediversal-dev";

      const uploadRequest = {
        bucketName,
        folderPath: `riders/${folder}`,
        fileName: `${Date.now()}-${file.name}`,
        fileContent,
      };

      const uploadRes = await uploadFile(token, uploadRequest);
      return uploadRes.result;
    } catch (error: any) {
      console.error(`Failed to upload ${folder} image:`, error);
      throw error;
    }
  };

  const fileToBase64 = async (fileUri: string): Promise<string> => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      throw error;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "service_city") {
      setSelectedPincodes([]);
      setFormData((prev) => ({
        ...prev,
        pin_code: [],
      }));
      setAvailablePincodes([]);
      setSearchPincodeQuery("");
      setShowPincodeDropdown(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile_number ||
      !formData.aadhar_number ||
      !formData.vehicle_type_id ||
      !formData.license_no ||
      !formData.service_city ||
      formData.pin_code.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (activeTab === "basic") {
      setActiveTab("documents");
      return;
    }

    setLoading(true);
    try {
      let licenseImageUrl = editRider?.license_image_url || "";
      let profileImageUrl = editRider?.profile_image_url || "";

      if (licenseImage) {
        licenseImageUrl = await uploadImageToServer(licenseImage, "licenses");
      }

      if (profileImage) {
        profileImageUrl = await uploadImageToServer(profileImage, "profiles");
      }

      const payload: any = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        aadhar_number: formData.aadhar_number,
        license_no: formData.license_no,
        license_image_url: licenseImageUrl,
        profile_image_url: profileImageUrl,
        vehicle_type_id: formData.vehicle_type_id,
        service_city_id: formData.service_city,
        pin_codes: formData.pin_code,
        joining_date: formData.joining_date,
        is_available: formData.is_available,
        is_POI_verified: formData.is_POI_verified,
      };

      console.log("Submitting payload:", payload);
      if (editRider) {
        payload.id = editRider.id;
        await updateRider(payload, token);
        toast.success("Rider updated successfully!");
      } else {
        await createRider(payload, token);
        toast.success("Rider added successfully!");
      }

      onSuccess();
      onClose();
      resetForm();
      setActiveTab("basic");
    } catch (error: any) {
      console.error("Error saving rider:", error);
      toast.error(error.message || "Failed to save rider");
    } finally {
      setLoading(false);
    }
  };

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
              name="vehicle_type_id"
              value={formData.vehicle_type_id}
              onChange={handleInputChange}
              disabled={fetchingVehicles}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
            >
              <option value="" className="text-gray-500">
                {fetchingVehicles
                  ? "Loading vehicles..."
                  : "Select vehicle type"}
              </option>
              {vehicleOptions.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.value}
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
              name="service_city"
              value={formData.service_city}
              onChange={handleInputChange}
              disabled={fetchingCities}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
            >
              <option value="" className="text-gray-500">
                {fetchingCities ? "Loading cities..." : "Select service city"}
              </option>
              {serviceCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.value}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Service PIN Codes
          </label>

          {selectedPincodes.length > 0 && (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">
                  Selected PIN Codes:
                </span>
                <button
                  type="button"
                  onClick={handleClearAllPincodes}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedPincodes.map((pincode) => (
                  <div
                    key={pincode.id}
                    className="flex items-center bg-blue-50 px-2 py-1 rounded text-xs"
                    style={{ color: "#0088B1" }}
                  >
                    <span>
                      {pincode.pincode}{" "}
                      {pincode.district ? `(${pincode.district})` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePincode(pincode.id)}
                      className="ml-1 hover:opacity-70"
                      style={{ color: "#0088B1" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative" ref={pincodeSearchRef}>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="pincode-search-input"
              type="text"
              value={searchPincodeQuery}
              onChange={handlePincodeSearchChange}
              onClick={handleSearchAreaClick}
              disabled={!formData.service_city || fetchingPincodes}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1] disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder={
                !formData.service_city
                  ? "Select a city first"
                  : fetchingPincodes
                  ? "Loading pincodes..."
                  : "Search pincodes..."
              }
            />

            {showPincodeDropdown &&
              formData.service_city &&
              availablePincodes.length > 0 && (
                <div
                  ref={pincodeDropdownRef}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {availablePincodes.map((pincode) => {
                    const isSelected = selectedPincodes.some(
                      (p) => p.pincode === pincode.pincode // Compare by pincode value
                    );
                    return (
                      <div
                        key={pincode.id}
                        onClick={() => handlePincodeSelect(pincode)}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        style={{ color: isSelected ? "#0088B1" : "#374151" }}
                      >
                        <span>
                          {pincode.pincode} - {pincode.district}
                        </span>
                        {isSelected && (
                          <Check
                            className="w-4 h-4"
                            style={{ color: "#0088B1" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {formData.service_city &&
            availablePincodes.length === 0 &&
            !fetchingPincodes &&
            searchPincodeQuery && (
              <p className="mt-1 text-xs text-gray-500">
                No pincodes found for "{searchPincodeQuery}"
              </p>
            )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Joining Date
          </label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            required
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {editRider ? "Edit Rider Details" : "Add New Rider"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("basic")}
            disabled={loading}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "basic"
                ? "bg-[#0088B1] text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:text-gray-400"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            disabled={loading}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "documents"
                ? "bg-[#0088B1] text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:text-gray-400"
            }`}
          >
            Documents
          </button>
        </div>

        <form className="flex-1 overflow-y-auto p-6">
          {activeTab === "basic" && renderBasicInformation()}
          {activeTab === "documents" && (
            <>
              <div className="flex flex-row gap-6 mb-10">
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
                          Profile photo uploaded
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
                          License uploaded
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
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_available: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
                />
                <div>
                  <div className="text-xs font-medium text-[#161D1F]">
                    Active Rider
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Inactive riders are not currently in service
                  </div>
                </div>
              </div>
            </>
          )}
        </form>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              resetForm();
              if (editRider && isOpen) {
                if (editRider) {
                  setFormData({
                    name: editRider.name,
                    email: editRider.email,
                    mobile_number: editRider.mobile_number,
                    aadhar_number: editRider.aadhar_number,
                    license_no: editRider.license_no,
                    vehicle_type_id: editRider.vehicle_type_id,
                    service_city: editRider.service_city_id,
                    pin_code: editRider.pin_codes,
                    joining_date: editRider.joining_date,
                    is_available: editRider.is_available_status === "active",
                    is_POI_verified:
                      editRider.is_poi_verified_status === "approved",
                  });
                  if (editRider.license_image_url)
                    setLicensePreview(editRider.license_image_url);
                  if (editRider.profile_image_url)
                    setProfilePreview(editRider.profile_image_url);
                }
              }
            }}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>

          <div className="flex gap-3">
            {activeTab === "documents" && (
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                disabled={loading}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}

            {activeTab === "basic" ? (
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                disabled={
                  loading ||
                  !formData.service_city ||
                  formData.pin_code.length === 0
                }
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs font-medium hover:bg-[#00729A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : editRider
                  ? "Update Rider"
                  : "Add Rider"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
