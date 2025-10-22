"use client";
import React, { useEffect, useState } from "react";
import { X, Upload, ChevronDown, Plus, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PhlebotomistType, Schedule } from "../type/index";

interface TimeRange {
  day: string;
  startTime: string;
  endTime: string;
}

interface AddPhlebotomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhlebotomist: (phlebotomist: Omit<PhlebotomistType, "id">) => void;
  onUpdatePhlebotomist?: (phlebotomist: PhlebotomistType) => void;
  editPhlebotomist?: PhlebotomistType | null;
}

export const AddPhlebotomistModal: React.FC<AddPhlebotomistModalProps> = ({
  isOpen,
  onClose,
  onAddPhlebotomist,
  onUpdatePhlebotomist,
  editPhlebotomist,
}) => {
  const [formData, setFormData] = useState<Omit<PhlebotomistType, "id">>({
    name: "",
    email: "",
    phone: "",
    experience: "",
    serviceArea: "",
    licenseNo: "",
    specialization: "",
    targetGroup: "",
    rating: "",
    serviceCityTown: "",
    joiningDate: "",
    certifications: [],
    schedules: [],
    samplesCollected: 0,
    status: "Active",
    location: "",
    activeOrders: 0,
    completedOrders: 0,
    isActivePhlebo: true,
    isHomeCertified: false,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [activeSection, setActiveSection] = useState<
    "Basic Details" | "Availability"
  >("Basic Details");
  const [newCertification, setNewCertification] = useState("");

  // Dropdown states
  const [showServiceCityDropdown, setShowServiceCityDropdown] = useState(false);
  const [showServiceAreaDropdown, setShowServiceAreaDropdown] = useState(false);

  // Dropdown options
  const specializationOptions = [
    "General Collection",
    "Paediatric Collection",
    "Geriatric Collection",
    "Specialized Collection",
  ];

  const targetGroupOptions = [
    "Senior Citizens",
    "Paediatric",
    "General",
    "Critical Care",
  ];

  const serviceCityOptions = [
    "Patna",
    "Begusarai",
    "Sasaram",
    "Gaya",
    "Muzaffarpur",
    "Bhagalpur",
    "Arrah",
    "Purnia",
    "Darbhanga",
  ];

  const serviceAreaOptions: { [key: string]: string[] } = {
    Patna: [
      "Zero Mile",
      "Kankarbagh",
      "Hanuman Nagar",
      "Krishna Kunj",
      "Raza Bazaar",
      "Lodipur",
      "Bakerganj",
      "Punatchak",
      "Rajendra Nagar",
      "Kadamkuan",
    ],
    Begusarai: ["Town Area", "Station Road", "Barauni", "Teghra", "Ballia"],
    Sasaram: ["City Center", "Station Road", "NH-2 Area"],
    Gaya: ["Bodh Gaya", "City Area", "Station Road"],
    Muzaffarpur: ["Club Road", "Ramna Road", "Kalyani Nagar"],
    Bhagalpur: ["Nathnagar", "Sabour", "City Area"],
    Arrah: ["City Center", "Jagdishpur"],
    Purnia: ["City Area", "Krityanand Nagar"],
    Darbhanga: ["Laheriasarai", "Town Area"],
  };

  const locationOptions = [
    "North Zone",
    "South Zone",
    "East Zone",
    "West Zone",
    "Central Zone",
  ];

  const certificationOptions = [
    "Home Collection Certified",
    "Paediatric Specialist",
    "Geriatric Specialist",
    "Advanced Phlebotomy",
    "Infection Control Certified",
  ];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeOptions = [
    "06:00 AM",
    "06:30 AM",
    "07:00 AM",
    "07:30 AM",
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
  ];

  // Availability Functions
  const [sameAsPrevious, setSameAsPrevious] = useState(false);
  const [maxPatientsPerSlot, setMaxPatientsPerSlot] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (editPhlebotomist && isOpen) {
      setFormData({
        name: editPhlebotomist.name,
        email: editPhlebotomist.email,
        phone: editPhlebotomist.phone,
        experience: editPhlebotomist.experience,
        serviceArea: editPhlebotomist.serviceArea,
        licenseNo: editPhlebotomist.licenseNo,
        specialization: editPhlebotomist.specialization,
        targetGroup: editPhlebotomist.targetGroup,
        rating: editPhlebotomist.rating || "",
        serviceCityTown: editPhlebotomist.serviceCityTown || "",
        joiningDate: editPhlebotomist.joiningDate || "",
        certifications: editPhlebotomist.certifications,
        schedules: editPhlebotomist.schedules,
        samplesCollected: editPhlebotomist.samplesCollected,
        status: editPhlebotomist.status,
        location: editPhlebotomist.location || "",
        activeOrders: editPhlebotomist.activeOrders || 0,
        completedOrders: editPhlebotomist.completedOrders || 0,
        isActivePhlebo: editPhlebotomist.isActivePhlebo ?? true,
        isHomeCertified: editPhlebotomist.isHomeCertified ?? false,
      });

      // Convert schedules to timeRanges for availability section
      const initialTimeRanges: TimeRange[] = [];
      editPhlebotomist.schedules.forEach((schedule) => {
        initialTimeRanges.push({
          day: "Monday", // Default day, you might want to store day info in Schedule
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        });
      });
      setTimeRanges(initialTimeRanges);
    } else if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        experience: "",
        serviceArea: "",
        licenseNo: "",
        specialization: "",
        targetGroup: "",
        rating: "",
        serviceCityTown: "",
        joiningDate: "",
        certifications: [],
        schedules: [],
        samplesCollected: 0,
        status: "Active",
        location: "",
        activeOrders: 0,
        completedOrders: 0,
        isActivePhlebo: true,
        isHomeCertified: false,
      });
      setTimeRanges([]);
      setSelectedDays([]);
    }
  }, [editPhlebotomist, isOpen]);

  const handleAddCertification = () => {
    if (
      newCertification.trim() &&
      !formData.certifications.includes(newCertification.trim())
    ) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (certification: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(
        (cert) => cert !== certification
      ),
    });
  };

  const handleAddCertificationFromOption = (certification: string) => {
    if (!formData.certifications.includes(certification)) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, certification],
      });
    }
  };

  // Add this useEffect to handle "same as previous day" functionality
  useEffect(() => {
    if (sameAsPrevious && selectedDays.length > 1) {
      const updatedRanges = [...timeRanges];
      const firstDayRanges = timeRanges.filter(
        (range) => range.day === selectedDays[0]
      );

      selectedDays.slice(1).forEach((day) => {
        // Remove existing ranges for this day
        const filteredRanges = updatedRanges.filter(
          (range) => range.day !== day
        );
        // Add copies of first day's ranges
        firstDayRanges.forEach((range) => {
          filteredRanges.push({ ...range, day });
        });
        setTimeRanges(filteredRanges);
      });
    }
  }, [sameAsPrevious, selectedDays]);

  // Add this function to handle max patients change
  const handleMaxPatientsChange = (day: string, value: number) => {
    setMaxPatientsPerSlot((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  // Update the addTimeRangeForDay function to include max patients default
  const addTimeRangeForDay = (day: string) => {
    if (timeRanges.filter((range) => range.day === day).length < 4) {
      setTimeRanges([
        ...timeRanges,
        { day, startTime: "09:00 AM", endTime: "05:00 PM" },
      ]);

      // Set default max patients if not set
      if (!maxPatientsPerSlot[day]) {
        setMaxPatientsPerSlot((prev) => ({
          ...prev,
          [day]: 0,
        }));
      }
    } else {
      toast.error("Maximum 4 time ranges per day allowed");
    }
  };

  // Update the handleDayToggle function to include max patients default
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      // Remove time ranges for the deselected day
      setTimeRanges(timeRanges.filter((range) => range.day !== day));
      // Remove max patients for deselected day
      setMaxPatientsPerSlot((prev) => {
        const newState = { ...prev };
        delete newState[day];
        return newState;
      });
    } else {
      setSelectedDays([...selectedDays, day]);
      // Add default time range for the new day
      setTimeRanges([
        ...timeRanges,
        { day, startTime: "09:00 AM", endTime: "05:00 PM" },
      ]);
      // Set default max patients for new day
      setMaxPatientsPerSlot((prev) => ({
        ...prev,
        [day]: 0,
      }));
    }
  };

  const updateTimeRange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedRanges = [...timeRanges];
    updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    setTimeRanges(updatedRanges);
  };

  const handleServiceCitySelect = (city: string) => {
    setFormData({
      ...formData,
      serviceCityTown: city,
      serviceArea: "", // Reset service area when city changes
    });
    setShowServiceCityDropdown(false);
  };

  const handleServiceAreaSelect = (area: string) => {
    setFormData({ ...formData, serviceArea: area });
    setShowServiceAreaDropdown(false);
  };

  const getAvailableServiceAreas = () => {
    return serviceAreaOptions[formData.serviceCityTown || ""] || [];
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.licenseNo || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert time ranges to schedules
    const schedules: Schedule[] = timeRanges.map((range) => ({
      startTime: range.startTime,
      endTime: range.endTime,
    }));

    const submitData: Omit<PhlebotomistType, "id"> = {
      ...formData,
      schedules,
      isActivePhlebo: formData.status === "Active",
      isHomeCertified: formData.certifications.includes(
        "Home Collection Certified"
      ),
    };

    if (editPhlebotomist && onUpdatePhlebotomist) {
      onUpdatePhlebotomist({
        ...submitData,
        id: editPhlebotomist.id,
      });
    } else if (onAddPhlebotomist) {
      onAddPhlebotomist(submitData);
    }
    onClose();
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
      targetGroup: "",
      rating: "",
      serviceCityTown: "",
      joiningDate: "",
      certifications: [],
      schedules: [],
      samplesCollected: 0,
      status: "Active",
      location: "",
      activeOrders: 0,
      completedOrders: 0,
      isActivePhlebo: true,
      isHomeCertified: false,
    });
    setSelectedDays([]);
    setTimeRanges([]);
    setMaxPatientsPerSlot({});
  };

  // Close dropdowns when clicking outside
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            placeholder="e.g., 6 Yrs."
          />
        </div>

        {/* Service City Dropdown */}
        <div className="dropdown-container relative">
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Service City/Town
          </label>
          <button
            type="button"
            onClick={() => setShowServiceCityDropdown(!showServiceCityDropdown)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
          >
            <span
              className={
                formData.serviceCityTown ? "text-black" : "text-gray-600"
              }
            >
              {formData.serviceCityTown || "Select service city"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showServiceCityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {serviceCityOptions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleServiceCitySelect(city)}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-600"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service Area Dropdown */}
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
              className={formData.serviceArea ? "text-black" : "text-gray-600"}
            >
              {formData.serviceArea || "Select service area"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showServiceAreaDropdown && formData.serviceCityTown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {getAvailableServiceAreas().map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleServiceAreaSelect(area)}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-600"
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
              <option value="">Select specialization</option>
              {specializationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
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
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Phlebotomist */}
        <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
          <input
            type="checkbox"
            checked={formData.isActivePhlebo}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActivePhlebo: e.target.checked,
                status: e.target.checked ? "Active" : "Inactive",
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
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

        {/* Home Collection Certified */}
        <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
          <input
            type="checkbox"
            checked={formData.isHomeCertified}
            onChange={(e) => {
              setFormData({
                ...formData,
                isHomeCertified: e.target.checked,
              });
              if (e.target.checked) {
                handleAddCertificationFromOption("Home Collection Certified");
              } else {
                handleRemoveCertification("Home Collection Certified");
              }
            }}
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
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

      {/* Time Range Options */}
      <div className="space-y-3 bg-[#F3F8FA] p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={sameAsPrevious}
            onChange={() => setSameAsPrevious(true)}
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300"
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
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300"
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

        {/* Time Ranges for Selected Days */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none"
                        >
                          <option value="">00:00 AM</option>
                          {timeOptions.map((time) => (
                            <option key={`start-${time}`} value={time}>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none"
                        >
                          <option value="">00:00 AM</option>
                          {timeOptions.map((time) => (
                            <option key={`end-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Max Patients per Slot */}
              <div className="mb-4">
                <label className="block text-[10px] text-gray-500 mb-1">
                  * Max Patients per Slot
                </label>
                <input
                  type="number"
                  value={maxPatientsPerSlot[day] || 0}
                  onChange={(e) =>
                    handleMaxPatientsChange(day, parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-[#0088B1] focus:outline-none"
                  min="0"
                />
              </div>

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

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection("Basic Details")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "Basic Details"
                ? "bg-[#0088B1] text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Details
          </button>
          <button
            onClick={() => setActiveSection("Availability")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "Availability"
                ? "bg-[#0088B1] text-white"
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
                className="px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A]"
              >
                {editPhlebotomist ? "Update Phlebotomist" : "Add Phlebotomist"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
