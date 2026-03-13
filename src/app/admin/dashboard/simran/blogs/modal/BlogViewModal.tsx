import React from "react";
import { X } from "lucide-react";
import { Blog } from "../types/types";
import StatusBadge from "@/app/components/common/StatusBadge";

interface BlogViewModalProps {
  isOpen: boolean;
  blog: Blog | null;
  onClose: () => void;
  onUpdate: (blog: Blog) => void;
}

const BlogViewModal: React.FC<BlogViewModalProps> = ({
  isOpen,
  blog,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#161D1F]">
            Blog Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 pb-4">
          <h3 className="text-[18px] font-bold text-[#161D1F] mb-2">
            {blog.title}
          </h3>
          <p className="text-[12px] text-[#899193] mb-4">
            {blog.shortDescription}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] font-semibold text-[#161D1F]">
              Tags:
            </span>
            <StatusBadge status={blog.active ? "Active" : "Inactive"} />
            {blog.featured && <StatusBadge status="Featured" />}
          </div>
          <div className="flex gap-8 mb-6">
            <div>
              <span className="text-[12px] font-semibold text-[#161D1F]">
                Estimated Read Time:{" "}
              </span>
              <span className="text-[12px] text-[#161D1F]">
                {blog.estimatedReadTime} min.
              </span>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-[#161D1F]">
                Category:{" "}
              </span>
              <span className="text-[12px] text-[#161D1F]">
                {blog.category}
              </span>
            </div>
          </div>
          {blog.sections.map((section, idx) => (
            <div key={section.id} className="mb-6">
              <p className="text-[12px] font-semibold text-[#0088B1] mb-2">
                Section {idx + 1}:
              </p>
              <div className="border border-[#E5E8E9] rounded-lg p-4">
                <p className="text-[13px] font-semibold text-[#161D1F] mb-2">
                  {section.subtitle}
                </p>
                <p className="text-[12px] text-[#161D1F] whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-8 py-4 border-t border-[#E5E8E9] flex justify-end flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onUpdate(blog);
            }}
            className="px-6 py-2 bg-[#0088B1] text-white text-[12px] rounded-lg hover:bg-[#00729A] transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal;
