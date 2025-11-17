import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { searchHospitals } from "../services";

interface Hospital {
  id: string;
  name: string;
}

interface HospitalSearchInputProps {
  selectedHospitals: string[];
  onHospitalChange: (hospitalIds: string[]) => void;
  token: string;
  initialHospitalNames?: Record<string, string>;
}

const HospitalSearchInput: React.FC<HospitalSearchInputProps> = ({
  selectedHospitals,
  onHospitalChange,
  token,
  initialHospitalNames = {},
}) => {
  const [searchText, setSearchText] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalNames, setSelectedHospitalNames] =
    useState<Record<string, string>>(initialHospitalNames);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (text: string) => {
    if (!text.trim()) {
      setHospitals([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchHospitals(text, token);
      setHospitals(response.hospitals);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching hospitals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    if (initialHospitalNames && Object.keys(initialHospitalNames).length > 0) {
      setSelectedHospitalNames(initialHospitalNames);
    }
  }, [initialHospitalNames]);

  const handleHospitalSelect = (hospital: Hospital) => {
    if (!selectedHospitals.includes(hospital.id)) {
      const newSelected = [...selectedHospitals, hospital.id];
      onHospitalChange(newSelected);

      setSelectedHospitalNames((prev) => ({
        ...prev,
        [hospital.id]: hospital.name,
      }));
    }
    setSearchText("");
    setShowDropdown(false);
  };

  const handleRemoveHospital = (hospitalId: string) => {
    const newSelected = selectedHospitals.filter((id) => id !== hospitalId);
    onHospitalChange(newSelected);

    setSelectedHospitalNames((prev) => {
      const updated = { ...prev };
      delete updated[hospitalId];
      return updated;
    });
  };

  return (
    <div className="relative">
      {selectedHospitals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedHospitals.map((hospitalId) => (
            <div
              key={hospitalId}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-[10px]"
            >
              {selectedHospitalNames[hospitalId] || hospitalId}
              <button
                type="button"
                onClick={() => handleRemoveHospital(hospitalId)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full text-[10px] px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
          placeholder="Search hospitals..."
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {showDropdown && (searchText || hospitals.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-[10px] text-gray-500">Searching...</div>
          ) : hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <button
                key={hospital.id}
                type="button"
                onClick={() => handleHospitalSelect(hospital)}
                disabled={selectedHospitals.includes(hospital.id)}
                className={`w-full text-left px-3 py-2 text-[10px] text-gray-800 hover:bg-gray-100 ${
                  selectedHospitals.includes(hospital.id)
                    ? "bg-gray-50 text-gray-900 cursor-not-allowed"
                    : ""
                }`}
              >
                {hospital.name}
                {selectedHospitals.includes(hospital.id) && (
                  <span className="ml-2 text-green-600">✓ Selected</span>
                )}
              </button>
            ))
          ) : searchText ? (
            <div className="p-3 text-[10px] text-gray-500">
              No hospitals found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HospitalSearchInput;
