import { Phone, X } from "lucide-react";
import { PhlebotomistType } from "../type/index";

const ViewPhlebotomistModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  phlebotomist: PhlebotomistType | null;
}> = ({ isOpen, onClose, phlebotomist }) => {
  if (!isOpen) return null;

  const getInitials = (name?: string): string => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#161D1F]">
            Phlebotomist Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#E8F4F7] rounded-full flex items-center justify-center text-[#0088B1] text-lg font-bold">
              {getInitials(phlebotomist?.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-[18px] font-semibold text-[#161D1F] mb-1">
                {phlebotomist?.name}
              </h3>
              <div className="text-xs text-gray-500 mb-3">
                {phlebotomist?.specialization}
                {phlebotomist?.targetGroup && ` | ${phlebotomist?.targetGroup}`}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs text-[#161D1F] font-medium">Tags:</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#E8F9ED] text-[#2E7D32] rounded-md text-xs border border-[#2E7D32]">
                {phlebotomist?.status}
              </span>
              {phlebotomist?.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#F3E5F5] text-[#9B51E0] rounded-md text-xs border border-[#9B51E0]"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div className="text-xs text-[#161D1F]">
            <span className="font-medium">License No.:</span>{" "}
            {phlebotomist?.licenseNo}
          </div>
          {/* Assigned Orders */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Assigned Orders
            </h4>
            <div className=" rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-12">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Active Orders:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.activeOrders || 0}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Completed Orders:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.completedOrders || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Personal Details
            </h4>
            <div className="bg-[#E8F4F7] rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-12">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Contact No.:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.phone}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Email ID:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
              Professional Details
            </h4>
            <div className="rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Joining Date:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.joiningDate || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Experience:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.experience}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Service City/Town:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.serviceCityTown || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#161D1F] font-medium">
                    Service Area:
                  </span>
                  <span className="ml-2 text-xs text-[#161D1F]">
                    {phlebotomist?.serviceArea || phlebotomist?.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button className="px-8 py-2.5 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A] flex items-center gap-2 font-medium">
            <Phone className="w-4 h-4" />
            Contact Phlebotomist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPhlebotomistModal;
