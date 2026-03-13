"use client";
import React, { useState } from "react";
import { Plus, Search, ChevronDown, FileText, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Blog, BlogFormData, BlogModalMode } from "./types/types";
import { dummyBlogs } from "./data/blogDummyData";
import { StatsCard } from "@/app/components/common/StatsCard";
import Pagination from "@/app/components/common/pagination";
import BlogTable from "./components/BlogTable";
import BlogModal from "../blogs/modal/BlogModal";
import BlogViewModal from "../blogs/modal/BlogViewModal";

const STATUS_OPTIONS = ["All Status", "Active", "Inactive"];
const ITEMS_PER_PAGE = 10;

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>(dummyBlogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<BlogModalMode>("add");
  const [editingBlog, setEditingBlog] = useState<Blog | undefined>(undefined);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  const totalBlogs = blogs.length;
  const activeBlogs = blogs.filter((b) => b.active).length;
  const inactiveBlogs = blogs.filter((b) => !b.active).length;
  const publishedByDoctors = blogs.filter((b) => b.publishedByDoctor).length;

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && b.active) ||
      (statusFilter === "Inactive" && !b.active);
    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;
  const paged = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const handleAddBlog = () => {
    setModalMode("add");
    setEditingBlog(undefined);
    setModalOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setModalMode("edit");
    setEditingBlog(blog);
    setModalOpen(true);
  };

  const handleViewBlog = (blog: Blog) => {
    setViewingBlog(blog);
    setViewModalOpen(true);
  };

  const handleModalSubmit = (data: BlogFormData) => {
    if (modalMode === "add") {
      const newBlog: Blog = {
        id: uuidv4(),
        title: data.title,
        shortDescription: data.shortDescription,
        author: data.author,
        authorSpecialty: "",
        category: data.category || "General",
        publishDate: data.publishDate,
        dateAdded: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        estimatedReadTime: Number(data.estimatedReadTime) || 0,
        coverImage: data.coverImage,
        sections: data.sections,
        active: data.active,
        featured: false,
        publishedByDoctor: false,
      };
      setBlogs((prev) => [newBlog, ...prev]);
    } else if (editingBlog) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlog.id
            ? {
                ...b,
                title: data.title,
                shortDescription: data.shortDescription,
                author: data.author,
                category: data.category || b.category,
                publishDate: data.publishDate,
                estimatedReadTime:
                  Number(data.estimatedReadTime) || b.estimatedReadTime,
                coverImage: data.coverImage || b.coverImage,
                sections: data.sections,
                active: data.active,
                dateAdded: new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              }
            : b,
        ),
      );
    }
  };

  const handleToggleActive = (id: string) => {
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const handleDelete = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((s) => s !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paged.map((b) => b.id) : []);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">Blogs</h1>
          <button
            onClick={handleAddBlog}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add New Blog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <StatsCard
            title="Total Blogs"
            stats={[
              { label: "Active", value: activeBlogs },
              { label: "Inactive", value: inactiveBlogs },
            ]}
            icon={<FileText className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Published by Doctors"
            stats={publishedByDoctors}
            icon={<Users className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs by title or author..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 min-w-[130px] justify-between"
            >
              {statusFilter}
              <ChevronDown className="w-4 h-4" />
            </button>
            {statusDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-[#E5E8E9] rounded-lg shadow-lg">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setStatusDropdownOpen(false);
                      setCurrentPage(0);
                    }}
                    className="block w-full text-left px-4 py-2 text-[12px] text-[#161D1F] hover:bg-[#E8F4F7]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Blogs
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {paged.length} of {totalItems} blogs
              </span>
            </h3>
          </div>

          <BlogTable
            blogs={paged}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelect={(id, checked) =>
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((s) => s !== id),
              )
            }
            onView={handleViewBlog}
            onEdit={handleEditBlog}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />

          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={false}
              onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
              onNext={() => setCurrentPage((p) => p + 1)}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>
      <BlogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={editingBlog}
        onSubmit={handleModalSubmit}
      />
      <BlogViewModal
        isOpen={viewModalOpen}
        blog={viewingBlog}
        onClose={() => setViewModalOpen(false)}
        onUpdate={(blog) => handleEditBlog(blog)}
      />
    </div>
  );
};

export default BlogPage;
