import React from "react";

interface LabeledInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-[10px] font-medium text-[#161D1F] mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        className="w-full px-3 py-3 text-[#899193] text-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088B1] focus:border-transparent outline-none"
      />
    </div>
  );
};

export default LabeledInput;
