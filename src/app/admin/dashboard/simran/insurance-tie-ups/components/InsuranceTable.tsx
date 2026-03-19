import React, { useState } from "react";
import { SquarePen, MoreVertical } from "lucide-react";
import { InsurancePartner } from "../types/types";
import StatusBadge from "@/app/components/common/StatusBadge";
import ActionMenu from "../ui/ActionMenu";

interface InsuranceTableProps {
  partners: InsurancePartner[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (partner: InsurancePartner) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const InsuranceTable: React.FC<InsuranceTableProps> = ({
  partners,
  selectedIds,
  onSelectAll,
  onSelect,
  onEdit,
  onToggleActive,
  onDelete,
  loading,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const allSelected =
    partners.length > 0 && selectedIds.length === partners.length;

  return (
    <div
      className="overflow-x-auto overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 320px)", minHeight: "400px" }}
    >
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Date Modified
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]" />
                </div>
              </td>
            </tr>
          ) : partners.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-[12px] text-[#899193]"
              >
                No insurance partners found.
              </td>
            </tr>
          ) : (
            partners.map((partner) => (
              <tr
                key={partner.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-[12px] text-[#161D1F] font-medium">
                  <div className="flex items-center gap-3">
                    {partner.logo && (
                      <img
                        src={partner.logo}
                        alt={""}
                        className="h-6 w-auto object-contain rounded-lg"
                      />
                    )}
                    {partner.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#161D1F]">
                  {partner.dateModified}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={partner.active ? "Active" : "Inactive"}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => onEdit(partner)}
                      className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      title="Edit"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === partner.id ? null : partner.id,
                          )
                        }
                        className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === partner.id && (
                        <ActionMenu
                          isActive={partner.active}
                          onToggleActive={() => onToggleActive(partner.id)}
                          onDelete={() => onDelete(partner.id)}
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

export default InsuranceTable;
