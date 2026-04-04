import React, { useState } from "react";
import { SquarePen, MoreVertical, Package, Building } from "lucide-react";
import { CorporateTieUp } from "../types/types";
import StatusBadge from "@/app/components/common/StatusBadge";
import ActionMenu from "../ui/ActionMenu";

interface CorporateTableProps {
  tieUps: CorporateTieUp[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (tieUp: CorporateTieUp) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const CorporateTable: React.FC<CorporateTableProps> = ({
  tieUps,
  selectedIds,
  onSelectAll,
  onSelect,
  onEdit,
  onToggleActive,
  onDelete,
  loading,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const allSelected = tieUps.length > 0 && selectedIds.length === tieUps.length;

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
              Sector
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
              <td colSpan={6} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]" />
                </div>
              </td>
            </tr>
          ) : tieUps.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-500 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No packages found
                  </h3>
                  <p className="text-gray-500">
                    No packages match your current criteria.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            tieUps.map((tieUp) => (
              <tr key={tieUp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[12px] text-[#161D1F] font-medium">
                  <div className="flex items-center gap-3">
                    {tieUp.logo && (
                      <img
                        src={tieUp.logo}
                        alt={""}
                        className="h-6 w-auto object-contain"
                      />
                    )}
                    {tieUp.companyName}
                  </div>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#161D1F]">
                  {tieUp.sector}
                </td>
                <td className="px-6 py-4 text-[12px] text-[#161D1F]">
                  {tieUp.dateModified}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={tieUp.active ? "Active" : "Inactive"} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => onEdit(tieUp)}
                      className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      title="Edit"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === tieUp.id ? null : tieUp.id,
                          )
                        }
                        className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === tieUp.id && (
                        <ActionMenu
                          isActive={tieUp.active}
                          onToggleActive={() => onToggleActive(tieUp.id)}
                          onDelete={() => onDelete(tieUp.id)}
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

export default CorporateTable;
