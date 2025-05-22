interface TabSwitchProps {
  activeTab: "email" | "mobile";
  onTabChange: (tab: "email" | "mobile") => void;
}

const TabSwitch: React.FC<TabSwitchProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex w-full mb-6">
      <button
        onClick={() => onTabChange("email")}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
          activeTab === "email"
            ? "bg-[#0088B1] text-white"
            : "bg-[#F8F8F8] text-[#161D1F]"
        }`}
      >
        Email
      </button>
      <button
        onClick={() => onTabChange("mobile")}
        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
          activeTab === "mobile"
            ? "bg-[#0088B1] text-white"
            : "bg-[#F8F8F8] text-[#161D1F]"
        }`}
      >
        Mobile Number
      </button>
    </div>
  );
};

export default TabSwitch;
