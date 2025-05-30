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
      <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={toggleOpen}
          className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none text-left flex items-center justify-between"
        >
          <span className={selected ? "text-black" : "text-gray-500"}>
            {selected || placeholder}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  toggleOpen();
                }}
                className="block w-full px-3 py-3 text-[#899193] text-[10px] text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
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
