import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownSelectorProps {
  label: string;
  options: string[];
  selected: string;
  placeholder: string;
  open: boolean;
  toggleOpen: () => void;
  onSelect: (value: string) => void;
}

const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  label,
  options,
  selected,
  placeholder,
  open,
  toggleOpen,
  onSelect,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[12px] text-[#161D1F] hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
        >
          <span className={selected ? "text-[#161D1F]" : "text-gray-500"}>
            {selected || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-[#161D1F]" />
        </button>
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  toggleOpen();
                }}
                className="block w-full px-4 py-2 text-[12px] text-[#161D1F] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelector;
