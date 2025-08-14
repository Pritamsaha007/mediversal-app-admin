import React from "react";
import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  staffRequirements: string[];
  equipmentIncluded: string[];
  status: "Excellent" | "Good" | "Available";
}

interface OfferingCardProps {
  offering: Offering;
  onEdit?: (offering: Offering) => void;
  onDelete?: (offeringId: string) => void;
}

const OfferingCard: React.FC<OfferingCardProps> = ({
  offering,
  onEdit,
  onDelete,
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 border-green-600 bg-green-50";
      case "Good":
        return "text-blue-600 border-blue-600 bg-blue-50";
      case "Available":
        return "text-gray-600 border-gray-600 bg-gray-50";
      default:
        return "text-gray-600 border-gray-600 bg-gray-50";
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold text-[#161D1F] mb-2">
            {offering.name}
          </h3>
          <p className="text-[12px] text-gray-600 mb-3">
            {offering.description}
          </p>
          <div className="text-[14px] font-semibold text-[#0088B1] mb-3">
            ₹{offering.price}/{offering.duration}
          </div>
          <div className="flex gap-2 mb-4">
            <span
              className={`px-3 py-1 text-[8px] border rounded-full ${getStatusBadgeColor(
                offering.status
              )}`}
            >
              {offering.status}
            </span>
            <span className="px-3 py-1 text-[8px] text-blue-600 border border-blue-600 rounded-full bg-blue-50">
              Available
            </span>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onEdit?.(offering);
                  setShowDropdown(false);
                }}
              >
                Edit
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  onDelete?.(offering.id);
                  setShowDropdown(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-[10px] font-medium text-[#161D1F] mb-2">
            Features & Inclusions:
          </h4>
          <ul className="space-y-1">
            {offering.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center text-[10px] text-gray-600"
              >
                <div className="w-2 h-2 text-[10px] bg-green-500 rounded-full mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
          {offering.features.length > 5 && (
            <button className="text-sm text-[#0088B1] mt-2">
              +2 more features
            </button>
          )}
        </div>

        <div>
          <h4 className="text-[10px] font-medium text-[#161D1F] mb-2">
            Staff Requirements:
          </h4>
          <div className="flex flex-wrap gap-2">
            {offering.staffRequirements.map((requirement, index) => (
              <span
                key={index}
                className="px-2 py-1 text-[8px] text-gray-600 border border-gray-300 rounded-md bg-gray-50"
              >
                {requirement}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-medium text-[#161D1F] mb-2">
            Equipment Included:
          </h4>
          <div className="flex flex-wrap gap-2">
            {offering.equipmentIncluded.map((equipment, index) => (
              <span
                key={index}
                className="px-2 py-1 text-[8px] text-gray-600 border border-gray-300 rounded-md bg-gray-50"
              >
                {equipment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferingCard;
