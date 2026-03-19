"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FAQItem } from "../services";

interface FAQModalProps {
  mode: "add" | "edit";
  initialData?: FAQItem | null;
  onClose: () => void;
  onSubmit: (payload: {
    id: string | null;
    question: string;
    answer: string;
    is_active: boolean;
    is_deleted: boolean;
  }) => Promise<void>;
}

export default function FAQModal({
  mode,
  initialData,
  onClose,
  onSubmit,
}: FAQModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ question?: string; answer?: string }>(
    {},
  );

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setQuestion(initialData.question);
      setAnswer(initialData.answer);
      setIsActive(initialData.is_active);
    }
  }, [mode, initialData]);

  const reset = () => {
    if (mode === "edit" && initialData) {
      setQuestion(initialData.question);
      setAnswer(initialData.answer);
      setIsActive(initialData.is_active);
    } else {
      setQuestion("");
      setAnswer("");
      setIsActive(false);
    }
    setErrors({});
  };

  const validate = () => {
    const e: { question?: string; answer?: string } = {};
    if (!question.trim()) e.question = "Question is required";
    if (!answer.trim()) e.answer = "Answer is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit({
        id: mode === "edit" && initialData ? initialData.id : null,
        question: question.trim(),
        answer: answer.trim(),
        is_active: isActive,
        is_deleted: false,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl mx-4 p-6 overflow-y-auto">
        <button className="absolute top-4 right-4 text-[#899193] hover:text-[#161D1F] transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-[16px] font-semibold text-[#161D1F] mb-5">
          {mode === "add" ? "Add New FAQs" : "Update FAQs:"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
              * Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question)
                  setErrors((p) => ({ ...p, question: undefined }));
              }}
              placeholder="Please enter the FAQ question, Ex - 'How do I book a doctor consultation?'"
              className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] placeholder:text-[#899193] focus:outline-none focus:ring-1 focus:ring-[#0088B1] ${
                errors.question
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#0088B1]"
              }`}
            />
            {errors.question && (
              <p className="mt-1 text-[11px] text-red-500">{errors.question}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-1">
              * Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errors.answer)
                  setErrors((p) => ({ ...p, answer: undefined }));
              }}
              placeholder="Short brief to the FAQ question..."
              rows={5}
              className={`w-full border rounded-lg px-3 py-2 text-[12px] text-[#161D1F] placeholder:text-[#899193] focus:outline-none focus:ring-1 focus:ring-[#0088B1] resize-none ${
                errors.answer
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#0088B1]"
              }`}
            />
            {errors.answer && (
              <p className="mt-1 text-[11px] text-red-500">{errors.answer}</p>
            )}
          </div>

          <div>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                isActive
                  ? "border-[#0088B1] bg-[#EBF7FB]"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-4 w-4 rounded flex items-center justify-center border-2 transition ${
                    isActive
                      ? "border-[#0088B1] bg-[#0088B1]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isActive && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#161D1F]">
                  Active FAQs
                </p>
                <p className="text-[11px] text-[#899193]">
                  Inactive FAQs would not be displayed at website
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              disabled={submitting}
              className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-[12px] bg-[#0088B1] text-white rounded-lg hover:bg-[#00729A] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {submitting
                ? "Saving..."
                : mode === "add"
                  ? "Add FAQs"
                  : "Update FAQs"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
