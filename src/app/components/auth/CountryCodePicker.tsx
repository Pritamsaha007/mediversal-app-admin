"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CountryCodePickerProps {
  value: string;
  onChange: (code: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
  ];

  const selectedCountry =
    countryCodes.find((c) => c.code === value) || countryCodes[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-4 border border-gray-300 rounded-l-lg bg-[#F8F8F8] text-[#B0B6B8] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0088B1] min-w-20"
      >
        <span className="flex items-center gap-2 text-sm">
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-[#B0B6B8]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-10 w-48 mt-1 bg-[#F8F8F8] text-[#B0B6B8] border border-gray-300 rounded-lg shadow-lg">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-200 first:rounded-t-lg last:rounded-b-lg"
            >
              <span>{country.flag}</span>
              <span>{country.code}</span>
              <span className="text-gray-500">{country.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryCodePicker;
