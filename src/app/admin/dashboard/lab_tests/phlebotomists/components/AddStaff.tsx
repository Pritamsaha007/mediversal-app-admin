"use client";
import React, { useEffect, useState } from "react";
import { X, ChevronDown, Plus, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminStore } from "@/app/store/adminStore";
import {
  createPhlebotomist,
  updatePhlebotomist,
  fetchDays,
  fetchPhleboSpecializations,
  fetchServiceCities,
  fetchServiceAreas,
  EnumItem,
} from "../../services";
import {
  CreatePhlebotomistPayload,
  Phlebotomist,
  PhlebotomistAvailability,
  UpdatePhlebotomistPayload,
} from "../type";

interface PhlebotomistFormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  serviceArea: string;
  licenseNo: string;
  specialization: string;
  rating: string;
  serviceCityTown: string;
  joiningDate: string;
  isActivePhlebo: boolean;
  isHomeCertified: boolean;
}

interface TimeRange {
  day: string;
  day_id: string;
  startTime: string;
  endTime: string;
  slot_capacity: number;
  id?: string;
}

interface AddPhlebotomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhlebotomist: (phlebotomist: Phlebotomist) => void;
  onUpdatePhlebotomist?: (phlebotomist: Phlebotomist) => void;
  editPhlebotomist?: Phlebotomist | null;
}

export const AddPhlebotomistModal: React.FC<AddPhlebotomistModalProps> = ({
  isOpen,
  onClose,
  onAddPhlebotomist,
  onUpdatePhlebotomist,
  editPhlebotomist,
}) => {
  const [formData, setFormData] = useState<PhlebotomistFormData>({
    name: "",
    email: "",
    phone: "",
    experience: "",
    serviceArea: "",
    licenseNo: "",
    specialization: "",
    rating: "",
    serviceCityTown: "",
    joiningDate: "",
    isActivePhlebo: true,
    isHomeCertified: false,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [activeSection, setActiveSection] = useState<
    "Basic Details" | "Availability"
  >("Basic Details");

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [enumDataLoaded, setEnumDataLoaded] = useState(false);

  const [showServiceCityDropdown, setShowServiceCityDropdown] = useState(false);
  const [showServiceAreaDropdown, setShowServiceAreaDropdown] = useState(false);

  const [daysData, setDaysData] = useState<EnumItem[]>([]);
  const [specializationsData, setSpecializationsData] = useState<EnumItem[]>(
    []
  );
  const [serviceCitiesData, setServiceCitiesData] = useState<EnumItem[]>([]);
  const [serviceAreasData, setServiceAreasData] = useState<EnumItem[]>([]);

  const { token, admin } = useAdminStore();

  const specializationOptions = specializationsData.map((item) => item.value);
  const serviceCityOptions = serviceCitiesData.map((item) => item.value);
  const serviceAreaOptions = serviceAreasData.map((item) => item.value);
  const days = daysData.map((item) => item.value);

  const timeOptions = [
    "06:00 AM",

    "07:00 AM",

    "08:00 AM",

    "09:00 AM",

    "10:00 AM",

    "11:00 AM",

    "12:00 PM",

    "01:00 PM",

    "02:00 PM",

    "03:00 PM",

    "04:00 PM",

    "05:00 PM",

    "06:00 PM",

    "07:00 PM",

    "08:00 PM",
  ];

  const [sameAsPrevious, setSameAsPrevious] = useState(false);

  useEffect(() => {
    const fetchEnumData = async () => {
      if (!isOpen || !token) return;

      setFetchingData(true);
      setEnumDataLoaded(false);
      try {
        const [
          daysResponse,
          specializationsResponse,
          citiesResponse,
          areasResponse,
        ] = await Promise.all([
          fetchDays(token),
          fetchPhleboSpecializations(token),
          fetchServiceCities(token),
          fetchServiceAreas(token),
        ]);

        console.log("Enum data fetched:", {
          days: daysResponse.roles,
          specializations: specializationsResponse.roles,
          cities: citiesResponse.roles,
          areas: areasResponse.roles,
        });

        setDaysData(daysResponse.roles || []);
        setSpecializationsData(specializationsResponse.roles || []);
        setServiceCitiesData(citiesResponse.roles || []);
        setServiceAreasData(areasResponse.roles || []);
        setEnumDataLoaded(true);
      } catch (error: any) {
        console.error("Error fetching enum data:", error);
        toast.error("Failed to load form data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchEnumData();
  }, [isOpen, token]);

  const convertTo24Hour = (timeStr: string): string => {
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
      return timeStr;
    }

    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const convertTo12Hour = (time24: string): string => {
    if (time24.includes("AM") || time24.includes("PM")) {
      return time24;
    }

    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  const findMatchingTimeOption = (time: string): string => {
    const matched = timeOptions.find((option) => option === time);
    if (!matched) {
      console.warn(
        `Time "${time}" not found in timeOptions. Available options:`,
        timeOptions
      );
    }
    return matched || timeOptions[0] || "09:00 AM";
  };
  const getDayId = (dayName: string): string => {
    const day = daysData.find((item) => item.value === dayName);
    if (!day) {
      console.warn(`Day not found: ${dayName}`);
    }
    return day?.id || "";
  };

  const getDayName = (dayId: string): string => {
    const day = daysData.find((item) => item.id === dayId);
    return day?.value || "";
  };

  const getCityId = (cityName: string): string => {
    const city = serviceCitiesData.find((item) => item.value === cityName);
    return city?.id || "";
  };

  const getAreaId = (areaName: string): string => {
    const area = serviceAreasData.find((item) => item.value === areaName);
    return area?.id || "";
  };

  const getSpecializationId = (specializationName: string): string => {
    const specialization = specializationsData.find(
      (item) => item.value === specializationName
    );
    return specialization?.id || "";
  };

  useEffect(() => {
    if (editPhlebotomist && isOpen && enumDataLoaded && daysData.length > 0) {
      console.log(
        "Initializing edit form with phlebotomist:",
        editPhlebotomist
      );

      setFormData({
        name: editPhlebotomist.name || "",
        email: editPhlebotomist.email || "",
        phone: editPhlebotomist.mobile_number || "",
        experience: editPhlebotomist.experience_in_yrs?.toString() || "",
        serviceArea: editPhlebotomist.service_area || "",
        licenseNo: editPhlebotomist.license_no || "",
        specialization: editPhlebotomist.specialization_id || "",
        rating: editPhlebotomist.rating?.toString() || "",
        serviceCityTown: editPhlebotomist.service_city || "",
        joiningDate: editPhlebotomist.joining_date || "",
        isActivePhlebo: editPhlebotomist.is_available ?? true,
        isHomeCertified: editPhlebotomist.is_home_collection_certified ?? false,
      });

      if (
        editPhlebotomist.availability &&
        editPhlebotomist.availability.length > 0
      ) {
        console.log("Processing availability:", editPhlebotomist.availability);

        const initialTimeRanges: TimeRange[] = [];
        const uniqueDays: string[] = [];

        editPhlebotomist.availability.forEach((schedule) => {
          const dayName = getDayName(schedule.day_id);
          console.log(
            `Converting schedule: day_id=${schedule.day_id}, dayName=${dayName}`
          );

          if (dayName) {
            let startTime = schedule.start_time;
            let endTime = schedule.end_time;

            if (!startTime.includes("AM") && !startTime.includes("PM")) {
              startTime = convertTo12Hour(startTime);
            }
            if (!endTime.includes("AM") && !endTime.includes("PM")) {
              endTime = convertTo12Hour(endTime);
            }

            const timeRange: TimeRange = {
              day: dayName,
              day_id: schedule.day_id,
              startTime: startTime,
              endTime: endTime,
              slot_capacity: schedule.slot_capacity || 0,
              id: schedule.id,
            };

            initialTimeRanges.push(timeRange);

            if (!uniqueDays.includes(dayName)) {
              uniqueDays.push(dayName);
            }
          }
        });

        console.log("Converted time ranges:", initialTimeRanges);
        console.log("Selected days:", uniqueDays);

        setTimeRanges(initialTimeRanges);
        setSelectedDays(uniqueDays);
      } else {
        console.log("No availability data found");
        setTimeRanges([]);
        setSelectedDays([]);
      }

      setActiveSection("Basic Details");
    } else if (isOpen && !editPhlebotomist) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        experience: "",
        serviceArea: "",
        licenseNo: "",
        specialization: "",
        rating: "",
        serviceCityTown: "",
        joiningDate: "",
        isActivePhlebo: true,
        isHomeCertified: false,
      });
      setTimeRanges([]);
      setSelectedDays([]);
      setActiveSection("Basic Details");
    }
  }, [editPhlebotomist, isOpen, enumDataLoaded, daysData.length]);
  useEffect(() => {
    if (sameAsPrevious && selectedDays.length > 1 && timeRanges.length > 0) {
      const firstDayRanges = timeRanges.filter(
        (range) => range.day === selectedDays[0]
      );

      if (firstDayRanges.length > 0) {
        const updatedRanges = [...timeRanges];

        const filteredRanges = updatedRanges.filter(
          (range) => range.day === selectedDays[0]
        );

        selectedDays.slice(1).forEach((day) => {
          firstDayRanges.forEach((range) => {
            filteredRanges.push({
              ...range,
              day,
              day_id: getDayId(day),
              id: undefined,
            });
          });
        });

        setTimeRanges(filteredRanges);
      }
    }
  }, [sameAsPrevious, selectedDays]);

  const addTimeRangeForDay = (day: string) => {
    const dayTimeRanges = timeRanges.filter((range) => range.day === day);

    if (dayTimeRanges.length < 4) {
      const newTimeRange: TimeRange = {
        day,
        day_id: getDayId(day),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        slot_capacity: 0,
      };

      setTimeRanges([...timeRanges, newTimeRange]);
    } else {
      toast.error("Maximum 4 time ranges per day allowed");
    }
  };

  const removeTimeRange = (index: number) => {
    const updatedRanges = timeRanges.filter((_, i) => i !== index);
    setTimeRanges(updatedRanges);
  };

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      setTimeRanges(timeRanges.filter((range) => range.day !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
      const newTimeRange: TimeRange = {
        day,
        day_id: getDayId(day),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        slot_capacity: 0,
      };
      setTimeRanges([...timeRanges, newTimeRange]);
    }
  };

  const updateTimeRange = (
    index: number,
    field: "startTime" | "endTime" | "slot_capacity",
    value: string | number
  ) => {
    const updatedRanges = [...timeRanges];

    if (field === "slot_capacity") {
      const numValue = typeof value === "string" ? parseInt(value) || 0 : value;
      updatedRanges[index] = { ...updatedRanges[index], [field]: numValue };
    } else {
      updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    }

    setTimeRanges(updatedRanges);
  };

  const handleServiceCitySelect = (city: string) => {
    setFormData({
      ...formData,
      serviceCityTown: city,
      serviceArea: "",
    });
    setShowServiceCityDropdown(false);
  };

  const handleServiceAreaSelect = (area: string) => {
    setFormData({ ...formData, serviceArea: area });
    setShowServiceAreaDropdown(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.licenseNo || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token || !admin) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);

    try {
      const availability: PhlebotomistAvailability[] = timeRanges.map(
        (range) => ({
          id: range.id,
          day_id: range.day_id,
          start_time: convertTo24Hour(range.startTime),
          end_time: convertTo24Hour(range.endTime),
          slot_capacity: range.slot_capacity || 0,
        })
      );

      const serviceCityId = getCityId(formData.serviceCityTown);
      const serviceAreaId = getAreaId(formData.serviceArea);
      const specializationId = getSpecializationId(formData.specialization);

      if (!serviceCityId || !serviceAreaId || !specializationId) {
        toast.error(
          "Please select valid service city, area, and specialization"
        );
        return;
      }

      let response;

      if (editPhlebotomist && onUpdatePhlebotomist) {
        const updatePayload: UpdatePhlebotomistPayload = {
          id: editPhlebotomist.id,
          name: formData.name,
          mobile_number: formData.phone,
          email: formData.email,
          rating: parseFloat(formData.rating) || 0,
          experience_in_yrs: parseInt(formData.experience) || 0,
          service_city: serviceCityId,
          service_area: serviceAreaId,
          specialization_id: specializationId,
          license_no: formData.licenseNo,
          joining_date: formData.joiningDate,
          is_home_collection_certified: formData.isHomeCertified,
          is_available: formData.isActivePhlebo,
          is_deleted: false,
          availability: availability,
        };

        console.log("Update Payload:", updatePayload);
        response = await updatePhlebotomist(updatePayload, token);

        const updatedPhlebotomist: Phlebotomist = {
          id: editPhlebotomist.id,
          name: updatePayload.name,
          mobile_number: updatePayload.mobile_number,
          email: updatePayload.email,
          rating: updatePayload.rating ?? 0,
          experience_in_yrs: updatePayload.experience_in_yrs ?? 0,
          service_city: updatePayload.service_city,
          service_area: updatePayload.service_area,
          specialization_id: updatePayload.specialization_id,
          license_no: updatePayload.license_no,
          joining_date: updatePayload.joining_date,
          is_home_collection_certified:
            updatePayload.is_home_collection_certified,
          is_available: updatePayload.is_available,
          is_deleted: updatePayload.is_deleted ?? false,
          availability: updatePayload.availability,
          created_by: editPhlebotomist.created_by,
          updated_by: editPhlebotomist.updated_by,
        };

        onUpdatePhlebotomist(updatedPhlebotomist);
        toast.success("Phlebotomist updated successfully!");
      } else {
        const createPayload: CreatePhlebotomistPayload = {
          name: formData.name,
          mobile_number: formData.phone,
          email: formData.email,
          rating: parseFloat(formData.rating) || 0,
          experience_in_yrs: parseInt(formData.experience) || 0,
          service_city: serviceCityId,
          service_area: serviceAreaId,
          specialization_id: specializationId,
          license_no: formData.licenseNo,
          joining_date: formData.joiningDate,
          is_home_collection_certified: formData.isHomeCertified,
          is_available: formData.isActivePhlebo,
          is_deleted: false,
          availability: availability,
        };

        console.log("Create Payload:", createPayload);
        response = await createPhlebotomist(createPayload, token);

        const newPhlebotomist: Phlebotomist = {
          id: response.phleboId,
          name: createPayload.name,
          mobile_number: createPayload.mobile_number,
          email: createPayload.email,
          rating: createPayload.rating ?? 0,
          experience_in_yrs: createPayload.experience_in_yrs ?? 0,
          service_city: createPayload.service_city,
          service_area: createPayload.service_area,
          specialization_id: createPayload.specialization_id,
          license_no: createPayload.license_no,
          joining_date: createPayload.joining_date,
          is_home_collection_certified:
            createPayload.is_home_collection_certified,
          is_available: createPayload.is_available,
          is_deleted: createPayload.is_deleted ?? false,
          availability: createPayload.availability,
        };

        onAddPhlebotomist(newPhlebotomist);
        toast.success("Phlebotomist created successfully!");
      }

      console.log("API Response:", response);
      onClose();
    } catch (error: any) {
      console.error("Error saving phlebotomist:", error);
      toast.error(error.message || "Failed to save phlebotomist");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      experience: "",
      serviceArea: "",
      licenseNo: "",
      specialization: "",
      rating: "",
      serviceCityTown: "",
      joiningDate: "",
      isActivePhlebo: true,
      isHomeCertified: false,
    });
    setSelectedDays([]);
    setTimeRanges([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowServiceCityDropdown(false);
        setShowServiceAreaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (fetchingData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-center p-12">
            <div className="text-gray-500">Loading form data...</div>
          </div>
        </div>
      </div>
    );
  }

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Contact Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="+91 00000 00000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Email ID
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Rating
          </label>
          <input
            type="text"
            value={formData.rating || ""}
            onChange={(e) =>
              setFormData({ ...formData, rating: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="4.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Experience
          </label>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) =>
              setFormData({ ...formData, experience: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="e.g., 6 Yrs."
          />
        </div>

        <div className="dropdown-container relative">
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Service City/Town
          </label>
          <button
            type="button"
            onClick={() => setShowServiceCityDropdown(!showServiceCityDropdown)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between text-gray-500"
          >
            <span
              className={
                formData.serviceCityTown ? "text-black" : "text-gray-500"
              }
            >
              {formData.serviceCityTown || "Select service city"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showServiceCityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {serviceCityOptions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleServiceCitySelect(city)}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-500"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-container relative">
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Service Area
          </label>
          <button
            type="button"
            onClick={() =>
              formData.serviceCityTown &&
              setShowServiceAreaDropdown(!showServiceAreaDropdown)
            }
            disabled={!formData.serviceCityTown}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between ${
              !formData.serviceCityTown ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span
              className={formData.serviceArea ? "text-black" : "text-gray-500"}
            >
              {formData.serviceArea || "Select service area"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showServiceAreaDropdown && formData.serviceCityTown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {serviceAreaOptions.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleServiceAreaSelect(area)}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-500"
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Specialization
          </label>
          <div className="relative">
            <select
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black bg-white appearance-none"
            >
              <option value="" className="text-gray-500">
                Select specialization
              </option>
              {specializationOptions.map((option) => (
                <option key={option} value={option} className="text-gray-500">
                  {option}
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
            value={formData.licenseNo}
            onChange={(e) =>
              setFormData({ ...formData, licenseNo: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500"
            placeholder="e.g., LIC0000347"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Joining Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.joiningDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, joiningDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black"
            />
            <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
          <input
            type="checkbox"
            checked={formData.isActivePhlebo}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActivePhlebo: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
          />
          <div>
            <div className="text-xs font-medium text-[#161D1F]">
              Active Phlebotomist
            </div>
            <div className="text-[10px] text-gray-500">
              Can this phlebotomist be assigned on the website
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
          <input
            type="checkbox"
            checked={formData.isHomeCertified}
            onChange={(e) => {
              setFormData({
                ...formData,
                isHomeCertified: e.target.checked,
              });
            }}
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
          />
          <div>
            <div className="text-xs font-medium text-[#161D1F]">
              Home Collection Certified
            </div>
            <div className="text-[10px] text-gray-500">
              Enable if Phlebotomist is certified for home sample collection
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAvailabilityDetails = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          * Availability (weekly)
        </label>
        <div className="text-[10px] text-[#0088B1] mb-2">Select Days</div>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-4 py-2 rounded-lg text-xs font-medium ${
                selectedDays.includes(day)
                  ? "bg-[#0088B1] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-[#F3F8FA] p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={sameAsPrevious}
            onChange={() => setSameAsPrevious(true)}
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300"
          />
          <label className="text-xs text-[#0088b1]">
            Select the same time range as the previous day
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={!sameAsPrevious}
            onChange={() => setSameAsPrevious(false)}
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300"
          />
          <label className="text-xs text-[#0088b1]">
            Make a fresh time range
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          Select time
        </label>

        {selectedDays.map((day, dayIndex) => {
          const dayTimeRanges = timeRanges.filter((range) => range.day === day);
          const previousDayRanges =
            dayIndex > 0
              ? timeRanges.filter(
                  (range) => range.day === selectedDays[dayIndex - 1]
                )
              : [];

          return (
            <div
              key={day}
              className="border border-gray-200 rounded-lg p-4 mb-3 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-medium text-[#161D1F]">
                  {day}
                </label>
                {sameAsPrevious &&
                  dayIndex > 0 &&
                  previousDayRanges.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Copying from {selectedDays[dayIndex - 1]}
                    </div>
                  )}
              </div>

              {dayTimeRanges.map((range, rangeIndex) => {
                const globalIndex = timeRanges.findIndex((r) => r === range);
                return (
                  <div
                    key={rangeIndex}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1">
                        <select
                          value={range.startTime}
                          onChange={(e) =>
                            updateTimeRange(
                              globalIndex,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none text-black"
                        >
                          <option value="" className="text-gray-500">
                            Select start time
                          </option>
                          {timeOptions.map((time) => (
                            <option
                              key={`start-${time}`}
                              value={time}
                              className="text-gray-500"
                              selected={time === range.startTime}
                            >
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-xs text-black">to</span>
                      <div className="relative flex-1">
                        <select
                          value={range.endTime}
                          onChange={(e) =>
                            updateTimeRange(
                              globalIndex,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none text-black"
                        >
                          <option value="" className="text-gray-500">
                            Select end time
                          </option>
                          {timeOptions.map((time) => (
                            <option
                              key={`end-${time}`}
                              value={time}
                              className="text-gray-500"
                            >
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] text-gray-500 mb-1">
                        Max Patients
                      </label>
                      <input
                        type="number"
                        value={
                          range.slot_capacity === 0 ? "" : range.slot_capacity
                        }
                        onChange={(e) => {
                          let value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value) || 0;

                          if (value > 2) value = 2;
                          if (value < 0) value = 0;

                          updateTimeRange(globalIndex, "slot_capacity", value);
                        }}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none text-black placeholder-gray-500"
                        min="0"
                        max="2"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTimeRange(globalIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addTimeRangeForDay(day)}
                disabled={dayTimeRanges.length >= 4}
                className={`text-xs text-[#0088B1] hover:text-[#00729A] flex items-center gap-1 ${
                  dayTimeRanges.length >= 4
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Plus className="w-3 h-3" />
                Add a new range
              </button>
            </div>
          );
        })}

        {selectedDays.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            Please select days to set availability
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {editPhlebotomist ? "Edit Phlebotomist" : "Add New Phlebotomist"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 px-5">
          <button
            onClick={() => setActiveSection("Basic Details")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "Basic Details"
                ? "bg-[#0088B1] rounded-md text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Details
          </button>
          <button
            onClick={() => setActiveSection("Availability")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "Availability"
                ? "bg-[#0088B1] rounded-md text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Availability
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "Basic Details" && renderBasicDetails()}
          {activeSection === "Availability" && renderAvailabilityDetails()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
          >
            Reset
          </button>

          <div className="flex gap-3">
            {activeSection !== "Basic Details" && (
              <button
                onClick={() => setActiveSection("Basic Details")}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
              >
                Previous
              </button>
            )}

            {activeSection === "Basic Details" ? (
              <button
                onClick={() => setActiveSection("Availability")}
                className="px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? "Saving..."
                  : editPhlebotomist
                  ? "Update Phlebotomist"
                  : "Add Phlebotomist"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
