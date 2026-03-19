"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search, ChevronDown, FileText, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  BlogAPI,
  BlogFormData,
  BlogModalMode,
  CreateUpdateBlogPayload,
} from "./types/types";
import { searchBlogs, createOrUpdateBlog } from "./services/blogService";
import { useAdminStore } from "@/app/store/adminStore";
import { StatsCard } from "@/app/components/common/StatsCard";
import Pagination from "@/app/components/common/pagination";
import BlogTable from "./components/BlogTable";
import BlogModal from "./modal/BlogModal";
import BlogViewModal from "./modal/BlogViewModal";

const STATUS_OPTIONS = ["All Status", "Active", "Inactive"];
const ITEMS_PER_PAGE = 20;

const BlogPage: React.FC = () => {
  const { token } = useAdminStore();

  const [blogs, setBlogs] = useState<BlogAPI[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<BlogModalMode>("add");
  const [editingBlog, setEditingBlog] = useState<BlogAPI | undefined>(
    undefined,
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<BlogAPI | null>(null);

  const fetchBlogs = useCallback(
    async (page: number, search: string, status: string) => {
      if (!token) return;
      setPageLoading(true);
      try {
        const filterActive =
          status === "Active" ? true : status === "Inactive" ? false : null;
        const res = await searchBlogs(
          {
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            search: search || null,
            filter_active: filterActive as any,
            filter_specialization_name: null,
            sort_by: "published_at",
            sort_order: "DESC",
          },
          token,
        );
        const fetchedBlogs = res.blogs || [];

        setBlogs(fetchedBlogs);

        setTotalItems(res.total ?? fetchedBlogs.length ?? 0);
      } catch (err: any) {
        toast.error(err.message || "Failed to load blogs");
      } finally {
        setPageLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchBlogs(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter, fetchBlogs]);

  const activeBlogs = blogs.filter((b) => b.is_active).length;
  const inactiveBlogs = blogs.filter((b) => !b.is_active).length;
  const publishedByDoctors = blogs.filter((b) => b.doctor_id).length;

  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;

  const buildPayload = (
    data: BlogFormData,
    existingBlog?: BlogAPI,
  ): CreateUpdateBlogPayload => ({
    id: existingBlog?.id ?? null,
    title: data.title,
    description: data.description,
    image_url: data.coverImageUrl ? [data.coverImageUrl] : [],
    sections: data.sections.map((s) => ({
      heading: s.subtitle,
      content: s.content,
    })),
    doctor_id: data.doctorId,
    published_at: data.publishDate,
    estimated_read_time_mins: Number(data.estimatedReadTime) || 0,
    is_active: data.active,
    is_deleted: false,
    created_by: null,
    updated_by: null,
  });

  const handleAddBlog = () => {
    setModalMode("add");
    setEditingBlog(undefined);
    setModalOpen(true);
  };
  const handleEditBlog = (blog: BlogAPI) => {
    setModalMode("edit");
    setEditingBlog(blog);
    setModalOpen(true);
  };
  const handleViewBlog = (blog: BlogAPI) => {
    setViewingBlog(blog);
    setViewModalOpen(true);
  };

  const handleModalSubmit = async (data: BlogFormData) => {
    if (!token) return;
    setSubmitLoading(true);
    try {
      const payload = buildPayload(
        data,
        modalMode === "edit" ? editingBlog : undefined,
      );
      await createOrUpdateBlog(payload, token);
      toast.success(
        modalMode === "add"
          ? "Blog created successfully"
          : "Blog updated successfully",
      );
      setModalOpen(false);
      fetchBlogs(currentPage, searchTerm, statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (blog: BlogAPI) => {
    if (!token) return;
    try {
      const payload: CreateUpdateBlogPayload = {
        id: blog.id,
        title: blog.title,
        description: blog.description,
        image_url: blog.image_url,
        sections: blog.sections,
        doctor_id: blog.doctor_id ?? null,
        published_at: blog.published_at,
        estimated_read_time_mins: blog.estimated_read_time_mins,
        is_active: !blog.is_active,
        is_deleted: false,
        created_by: null,
        updated_by: null,
      };
      await createOrUpdateBlog(payload, token);
      toast.success(
        `Blog marked as ${!blog.is_active ? "Active" : "Inactive"}`,
      );
      fetchBlogs(currentPage, searchTerm, statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to update blog");
    }
  };

  const handleDelete = async (blog: BlogAPI) => {
    if (!token) return;
    try {
      const payload: CreateUpdateBlogPayload = {
        id: blog.id,
        title: blog.title,
        description: blog.description,
        image_url: blog.image_url,
        sections: blog.sections,
        doctor_id: blog.doctor_id ?? null,
        published_at: blog.published_at,
        estimated_read_time_mins: blog.estimated_read_time_mins,
        is_active: blog.is_active,
        is_deleted: true,
        created_by: null,
        updated_by: null,
      };
      await createOrUpdateBlog(payload, token);
      toast.success("Blog deleted successfully");
      fetchBlogs(currentPage, searchTerm, statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog");
    }
  };

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? blogs.map((b) => b.id) : []);

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
                Showing {blogs.length} of {totalItems} blogs
              </span>
            </h3>
          </div>

          <BlogTable
            blogs={blogs}
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
            loading={pageLoading}
          />

          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={pageLoading}
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
        loading={submitLoading}
      />

      <BlogViewModal
        isOpen={viewModalOpen}
        blog={viewingBlog}
        onClose={() => setViewModalOpen(false)}
        onUpdate={(blog) => {
          setViewModalOpen(false);
          handleEditBlog(blog);
        }}
      />
    </div>
  );
};

export default BlogPage;
