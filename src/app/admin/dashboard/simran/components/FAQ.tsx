"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import { listFAQs, upsertFAQ, FAQItem } from "../services";
import FAQModal from "./FAQModal";
import toast from "react-hot-toast";

function DeleteConfirmDialog({
  question,
  onConfirm,
  onCancel,
  deleting,
}: {
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-[#161C1F]">Delete FAQ?</h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-medium text-[#161C1F]">"{question}"</span>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-[#E2E8F0] px-5 py-2.5 text-sm font-semibold text-[#161C1F] hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { token } = useAdminStore();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  const [deletingFaq, setDeletingFaq] = useState<FAQItem | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        setLoading(true);
        const res = await listFAQs(token);
        setFaqs((res.faqs || []).filter((f) => !f.is_deleted));
      } catch (err: any) {
        setFetchError(err?.message || "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchFaqs();
  }, [token]);

  const handleModalSubmit = async (payload: {
    id: string | null;
    question: string;
    answer: string;
    is_active: boolean;
    is_deleted: boolean;
  }) => {
    const isEdit = !!payload.id;

    const promise = upsertFAQ(payload, token);

    await toast.promise(promise, {
      loading: isEdit ? "Updating FAQ..." : "Adding FAQ...",
      success: isEdit ? "FAQ updated successfully" : "FAQ added successfully",
      error: "Something went wrong",
    });

    if (payload.id) {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === payload.id
            ? {
                ...f,
                question: payload.question,
                answer: payload.answer,
                is_active: payload.is_active,
              }
            : f,
        ),
      );
    } else {
      const res = await listFAQs(token);
      setFaqs((res.faqs || []).filter((f) => !f.is_deleted));
    }
  };
  const handleDelete = async () => {
    if (!deletingFaq) return;

    try {
      setDeleteInProgress(true);

      const promise = upsertFAQ(
        {
          id: deletingFaq.id,
          question: deletingFaq.question,
          answer: deletingFaq.answer,
          is_active: deletingFaq.is_active,
          is_deleted: true,
        },
        token,
      );

      await toast.promise(promise, {
        loading: "Deleting FAQ...",
        success: "FAQ deleted successfully",
        error: "Failed to delete FAQ",
      });

      setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id));
      setDeletingFaq(null);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const openAdd = () => {
    setEditingFaq(null);
    setModalMode("add");
  };

  const openEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setModalMode("edit");
  };

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#095A50] sm:text-4xl lg:text-5xl">
            Frequently Asked Questions (FAQs)
          </h2>
          <p className="mt-3 text-base text-[#161D1F] sm:text-lg">
            Quick answers to what patients ask most
          </p>
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
          <div className="space-y-4">
            {faqs.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">
                No FAQs yet. Add your first FAQ using the button below.
              </p>
            )}

            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-xl border bg-white transition hover:shadow-soft ${
                  openIndex === index ? "border-[#095A50]" : "border-[#E2E8F0]"
                }`}
              >
                <div className="flex w-full items-center justify-between px-6 py-5">
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="flex flex-1 items-center justify-between text-left gap-4"
                  >
                    <span className="text-base font-semibold text-[#161C1F] sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#161D1F] transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div className="ml-4 flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(faq)}
                      title="Edit FAQ"
                      className="rounded-lg border border-[#E2E8F0] p-2 text-gray-500 hover:border-[#095A50] hover:text-[#095A50] transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeletingFaq(faq)}
                      title="Delete FAQ"
                      className="rounded-lg border border-[#E2E8F0] p-2 text-gray-500 hover:border-red-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-sm text-[#161D1F] sm:text-base">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={openAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#095A50]/40 py-4 text-sm font-semibold text-[#095A50] hover:border-[#095A50] hover:bg-[#E6FFFC]/50 transition"
            >
              <Plus className="h-4 w-4" />
              Add New FAQ
            </button>
          </div>
        )}
      </div>

      {modalMode && (
        <FAQModal
          mode={modalMode}
          initialData={editingFaq}
          onClose={() => {
            setModalMode(null);
            setEditingFaq(null);
          }}
          onSubmit={handleModalSubmit}
        />
      )}

      {deletingFaq && (
        <DeleteConfirmDialog
          question={deletingFaq.question}
          onConfirm={handleDelete}
          onCancel={() => setDeletingFaq(null)}
          deleting={deleteInProgress}
        />
      )}
    </section>
  );
}
