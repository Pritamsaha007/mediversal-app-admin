import React from "react";

interface LabeledCheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  highlighted?: boolean;
}

const LabeledCheckbox: React.FC<LabeledCheckboxProps> = ({
  label,
  description,
  checked,
  onChange,
  highlighted = false,
}) => {
  return (
    <div
      className={`p-4 border ${
        highlighted
          ? "border-2 border-[#0088B1] bg-[#E8F4F7]"
          : "border-gray-200"
      } rounded-lg`}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-0.5 ${highlighted ? "accent-[#0088B1]" : ""}`}
        />
        <div>
          <div className="font-medium text-[10px] text-[#161D1F]">{label}</div>
          {description && (
            <div className="text-[8px] text-[#899193]">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabeledCheckbox;
