"use client";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useAdminStore } from "@/app/store/adminStore";
import {
  listPatientStories,
  upsertPatientStory,
  PatientStory,
} from "../services";
import PatientStoryModal from "./PatientStoryModal";

function DeleteConfirmDialog({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-[16px] font-semibold text-[#161D1F]">
          Delete Review?
        </h3>
        <p className="mt-2 text-[12px] text-[#899193]">
          Are you sure you want to delete the review by{" "}
          <span className="font-medium text-[#161D1F]">"{name}"</span>? This
          cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-[12px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60"
          >
            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

export default function Testimonials() {
  const { token } = useAdminStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [stories, setStories] = useState<PatientStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingStory, setEditingStory] = useState<PatientStory | null>(null);

  const [deletingStory, setDeletingStory] = useState<PatientStory | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    async function fetchStories() {
      try {
        setLoading(true);
        const res = await listPatientStories(token);
        setStories((res.patient_stories || []).filter((s) => !s.is_deleted));
      } catch (err: any) {
        setFetchError(err?.message || "Failed to load patient stories");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStories();
  }, [token]);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollPosition();
    el.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [stories]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (direction === "left" ? -400 : 400),
      behavior: "smooth",
    });
  };

  const handleModalSubmit = async (payload: {
    id: string | null;
    customer_name: string;
    city: string;
    state: string;
    feedback: string;
    profile_pic_url: string;
    is_active: boolean;
    is_deleted: boolean;
    feedback_date: string;
  }) => {
    await upsertPatientStory(payload, token);
    const res = await listPatientStories(token);
    setStories((res.patient_stories || []).filter((s) => !s.is_deleted));
  };

  const handleDelete = async () => {
    if (!deletingStory) return;
    try {
      setDeleteInProgress(true);
      await upsertPatientStory(
        {
          id: deletingStory.id,
          customer_name: deletingStory.customer_name,
          city: deletingStory.city,
          state: deletingStory.state,
          feedback: deletingStory.feedback,
          profile_pic_url: deletingStory.profile_pic_url,
          is_active: deletingStory.is_active,
          is_deleted: true,
          feedback_date: deletingStory.feedback_date,
        },
        token,
      );
      setStories((prev) => prev.filter((s) => s.id !== deletingStory.id));
      setDeletingStory(null);
    } finally {
      setDeleteInProgress(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#095A50] sm:text-4xl lg:text-5xl">
              Why patients trust us
            </h2>
            <p className="mt-3 text-base text-[#161D1F] sm:text-lg">
              Real experiences from real patients.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStory(null);
              setModalMode("add");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#0088B1] px-4 py-2 text-[12px] font-medium text-[#0088B1] hover:bg-[#EBF7FB] transition flex-shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#095A50]" />
          </div>
        )}

        {fetchError && !loading && (
          <p className="text-center text-sm text-red-500 py-8">{fetchError}</p>
        )}

        {!loading && !fetchError && (
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 -ml-10 hidden sm:flex items-center justify-center rounded-full p-1"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 -mr-10 hidden sm:flex items-center justify-center rounded-full p-1"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto sm:px-8 pb-4 no-scrollbar"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onScroll={checkScrollPosition}
            >
              {stories.length === 0 && (
                <p className="text-sm text-gray-400 py-10 px-4">
                  No patient reviews yet. Add the first one.
                </p>
              )}

              {stories.map((story) => (
                <div
                  key={story.id}
                  className="w-80 shrink-0 sm:w-96"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex justify-end gap-1.5 mb-2">
                    <button
                      onClick={() => {
                        setEditingStory(story);
                        setModalMode("edit");
                      }}
                      title="Edit review"
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-[#0088B1] hover:text-[#0088B1] transition bg-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingStory(story)}
                      title="Delete review"
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-400 hover:text-red-500 transition bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div
                    className={`h-full rounded-2xl p-8 transition hover:shadow-soft border-2 ${
                      story.is_active
                        ? "bg-[#F0FBF9] border-transparent"
                        : "bg-gray-50 border-gray-200 opacity-70"
                    }`}
                  >
                    <Image
                      src="/Frame 2147227806 (1).svg"
                      alt="quote"
                      width={72}
                      height={72}
                      className="h-18 w-18"
                    />

                    <p className="mt-4 text-base leading-relaxed font-medium text-[#6D7578]">
                      {story.feedback}
                    </p>

                    <p className="mt-4 text-sm italic font-medium text-[#6D7578]">
                      {timeAgo(story.feedback_date)}
                    </p>

                    <div className="mt-6 flex items-center justify-end">
                      <div>
                        <p className="text-base font-bold text-[#161C1F]">
                          {story.customer_name}
                        </p>
                        <p className="text-sm font-medium text-[#6D7578]">
                          {story.city}, {story.state}
                        </p>
                      </div>

                      {story.profile_pic_url ? (
                        <img
                          src={story.profile_pic_url}
                          alt={story.customer_name}
                          className="h-14 w-14 rounded-full object-cover ml-5 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-[#095A50]/10 ml-5 flex-shrink-0 flex items-center justify-center text-[#095A50] font-bold text-lg">
                          {story.customer_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <PatientStoryModal
          mode={modalMode}
          initialData={editingStory}
          onClose={() => {
            setModalMode(null);
            setEditingStory(null);
          }}
          onSubmit={handleModalSubmit}
        />
      )}

      {deletingStory && (
        <DeleteConfirmDialog
          name={deletingStory.customer_name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingStory(null)}
          deleting={deleteInProgress}
        />
      )}
    </section>
  );
}
