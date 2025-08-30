import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, UserPlus, X, Trash2 } from "lucide-react";

import { DetailedBooking } from "./booking";

interface DropdownMenuProps {
  booking: DetailedBooking;
  onViewDetails: (booking: DetailedBooking) => void;
  onEditBooking: (bookingId: string) => void;
  onAssignStaff: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  booking,
  onViewDetails,
  onEditBooking,
  onAssignStaff,
  onCancelBooking,
  onDeleteBooking,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: Eye,
      label: "View Details",
      onClick: () => {
        onViewDetails(booking);
        setIsOpen(false);
      },
      className: "text-[#161D1F] hover:bg-gray-50",
    },
    // {
    //   icon: Edit,
    //   label: "Edit Booking",
    //   onClick: () => {
    //     onEditBooking(booking.id);
    //     setIsOpen(false);
    //   },
    //   className: "text-[#161D1F] hover:bg-gray-50",
    // },
    {
      icon: UserPlus,
      label: "Assign Staff",
      onClick: () => {
        onAssignStaff(booking.id);
        setIsOpen(false);
      },
      className: "text-[#161D1F] hover:bg-gray-50",
    },
    // {
    //   icon: X,
    //   label: "Cancel Booking",
    //   onClick: () => {
    //     onCancelBooking(booking.id);
    //     setIsOpen(false);
    //   },
    //   className: "text-[#161D1F] hover:bg-gray-50",
    // },
    // {
    //   icon: Trash2,
    //   label: "Delete Booking",
    //   onClick: () => {
    //     onDeleteBooking(booking.id);
    //     setIsOpen(false);
    //   },
    //   className: "text-red-600 hover:bg-red-50",
    // },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="More actions"
      >
        <MoreVertical className="w-5 h-5 text-[#899193]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex text-[12px] items-center gap-3 w-full px-4 py-2 text-left transition-colors ${item.className}`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
