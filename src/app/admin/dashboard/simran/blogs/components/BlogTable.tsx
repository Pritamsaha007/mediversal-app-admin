import React, { useState } from "react";
import { Eye, SquarePen, MoreVertical } from "lucide-react";
import { BlogAPI } from "../types/types";
import StatusBadge from "@/app/components/common/StatusBadge";
import BlogActionMenu from "./BlogActionMenu";

interface BlogTableProps {
  blogs?: BlogAPI[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onView: (blog: BlogAPI) => void;
  onEdit: (blog: BlogAPI) => void;
  onToggleActive: (blog: BlogAPI) => void;
  onDelete: (blog: BlogAPI) => void;
  loading?: boolean;
}

const BlogTable: React.FC<BlogTableProps> = ({
  blogs = [],
  selectedIds = [],
  onSelectAll,
  onSelect,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  loading,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const allSelected = blogs.length > 0 && selectedIds.length === blogs.length;

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
              Title & Description
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
              Date Added
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
          ) : blogs.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-[12px] text-[#899193]"
              >
                No blogs found.
              </td>
            </tr>
          ) : (
            blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(blog.id)}
                    onChange={(e) => onSelect(blog.id, e.target.checked)}
                    className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded mt-1"
                  />
                </td>
                <td className="px-6 py-4 max-w-[240px] align-top">
                  <p className="text-[12px] font-semibold text-[#161D1F] mb-1 leading-snug">
                    {blog.title}
                  </p>
                  <p className="text-[10px] text-[#899193] leading-relaxed line-clamp-3">
                    {blog.description}
                  </p>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="text-[12px] text-[#161D1F]">
                    {blog.author_name || blog.doctor_name || "—"}
                  </p>
                </td>
                <td className="px-6 py-4 align-top text-[12px] text-[#161D1F]">
                  {blog.published_at?.split("T")[0] || "—"}
                </td>
                <td className="px-6 py-4 align-top">
                  <StatusBadge
                    status={blog.is_active ? "Active" : "Inactive"}
                  />
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => onView(blog)}
                      className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(blog)}
                      className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      title="Edit"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === blog.id ? null : blog.id)
                        }
                        className="text-[#161D1F] hover:text-[#0088B1] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === blog.id && (
                        <BlogActionMenu
                          isActive={blog.is_active}
                          onToggleActive={() => {
                            onToggleActive(blog);
                            setOpenMenuId(null);
                          }}
                          onDelete={() => {
                            onDelete(blog);
                            setOpenMenuId(null);
                          }}
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

export default BlogTable;
