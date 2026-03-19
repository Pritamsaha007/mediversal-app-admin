import React, { useState } from "react";
import { Eye, MoreVertical, CalendarDays, Phone } from "lucide-react";
import { Lead } from "../type/type";
import LeadStatusBadge from "@/app/components/common/StatusBadge";
import LeadActionMenu from "./LeadActionMenu";

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onView: (lead: Lead) => void;
  onMarkInProgress: (id: string) => void;
  onMarkConverted: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads = [],
  selectedIds = [],
  onSelectAll,
  onSelect,
  onView,
  onMarkInProgress,
  onMarkConverted,
  onDelete,
  loading,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div
      className="overflow-x-auto overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 360px)", minHeight: "400px" }}
    >
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
              />
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Patient Details
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Inquiry Type
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Email ID
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Date Requested
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Lead Status
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]" />
                </div>
              </td>
            </tr>
          ) : leads.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-12 text-center text-[12px] text-[#899193]"
              >
                No leads found.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lead.id)}
                    onChange={(e) => onSelect(lead.id, e.target.checked)}
                    className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
                  />
                </td>

                {/* Patient Details */}
                <td className="px-6 py-4 align-top">
                  <p className="text-[12px] font-semibold text-[#161D1F]">
                    {lead.patientName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#899193]" />
                    <p className="text-[10px] text-[#899193]">{lead.phone}</p>
                  </div>
                  {lead.dob && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3 h-3 text-[#899193]" />
                      <p className="text-[10px] text-[#899193]">{lead.dob}</p>
                    </div>
                  )}
                </td>

                {/* Inquiry Type */}
                <td className="px-6 py-4 align-top">
                  <span className="text-[12px] text-[#0088B1] font-medium">
                    {lead.inquiryType}
                  </span>
                </td>

                {/* Email */}
                <td className="px-6 py-4 align-top text-[12px] text-[#161D1F]">
                  {lead.email || "—"}
                </td>

                {/* Date Requested */}
                <td className="px-6 py-4 align-top text-[12px] text-[#161D1F]">
                  {lead.dateRequested}
                </td>

                {/* Status */}
                <td className="px-6 py-4 align-top">
                  <LeadStatusBadge status={lead.leadStatus} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => onView(lead)}
                      className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === lead.id ? null : lead.id)
                        }
                        className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === lead.id && (
                        <LeadActionMenu
                          onMarkInProgress={() => onMarkInProgress(lead.id)}
                          onMarkConverted={() => onMarkConverted(lead.id)}
                          onDelete={() => onDelete(lead.id)}
                          onClose={() => setOpenMenuId(null)}
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
