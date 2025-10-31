"use client";
import React, { useEffect, useState } from "react";
import { X, Upload, Plus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { RadiologyTest } from "../types";
import {
  EnumItem,
  fetchBodyParts,
  fetchCategories,
  fetchModalities,
  uploadFile,
} from "../../services";
import { useAdminStore } from "@/app/store/adminStore";
import { createPathologyTest, updatePathologyTest } from "../../services/index";

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (test: RadiologyTest) => void;
  onUpdateTest?: (test: RadiologyTest) => void;
  editTest?: RadiologyTest | null;
}

export const AddTestModal: React.FC<AddTestModalProps> = ({
  isOpen,
  onClose,
  onAddTest,
  onUpdateTest,
  editTest,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    category_id: "",
    sample_type_ids: [] as string[],
    test_params: [] as string[],
    report_time_hrs: 0,
    cost_price: 0,
    selling_price: 0,
    preparation_instructions: [] as string[],
    precautions: [] as string[],
    is_fasting_reqd: false,
    in_person_visit_reqd: false,
    is_featured_lab_test: false,
    is_home_collection_available: false,
    is_active: true,
    image_url: "",
    modality_type_id: "",
    inspection_parts_ids: [] as string[],
    related_lab_test_ids: [] as string[],
  });
  const [newInstruction, setNewInstruction] = useState("");
  const [newPrecaution, setNewPrecaution] = useState("");
  const [activeSection, setActiveSection] = useState<"basic" | "settings">(
    "basic"
  );

  const { token } = useAdminStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showReportTimeDropdown, setShowReportTimeDropdown] = useState(false);
  const [showModalityDropdown, setShowModalityDropdown] = useState(false);
  const [showInspectionPartsDropdown, setShowInspectionPartsDropdown] =
    useState(false);
  const [category_id, setCategory_id] = useState<string>("");
  const [modalityOptions, setModalityOptions] = useState<EnumItem[]>([]);
  const [inspectionPartsOptions, setInspectionPartsOptions] = useState<
    EnumItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reportTimeOptions = [6, 12, 16, 32, 48, 64, 72];

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const modalities = await fetchModalities(token);
      setModalityOptions(modalities.roles || []);
      const inspectionParts = await fetchBodyParts(token);
      setInspectionPartsOptions(inspectionParts.roles || []);

      const categoryData = await fetchCategories(token);
      const defaultCategoryId = categoryData.roles[11]?.id || "";
      console.log(defaultCategoryId);
      setCategory_id(defaultCategoryId);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load dropdown options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (editTest && isOpen) {
      setFormData({
        name: editTest.name || "",
        description: editTest.description || "",
        code: editTest.code || "",
        category_id: category_id || "",
        sample_type_ids: editTest.sample_type_ids || [],
        test_params: editTest.test_params || [],
        report_time_hrs: editTest.report_time_hrs || 0,
        cost_price: editTest.cost_price || 0,
        selling_price: editTest.selling_price || 0,
        preparation_instructions: editTest.preparation_instructions || [],
        precautions: editTest.precautions || [],
        is_fasting_reqd: editTest.is_fasting_reqd || false,
        in_person_visit_reqd: editTest.in_person_visit_reqd || false,
        is_featured_lab_test: editTest.is_featured_lab_test || false,
        is_home_collection_available:
          editTest.is_home_collection_available || false,
        is_active: editTest.is_active !== undefined ? editTest.is_active : true,
        image_url: editTest.image_url || "",
        modality_type_id: editTest.modality_type_id || "",
        inspection_parts_ids: editTest.inspection_parts_ids || [],
        related_lab_test_ids: editTest.related_lab_test_ids || [],
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        code: "",
        category_id: category_id,
        sample_type_ids: [],
        test_params: [],
        report_time_hrs: 0,
        cost_price: 0,
        selling_price: 0,
        preparation_instructions: [],
        precautions: [],
        is_fasting_reqd: false,
        in_person_visit_reqd: false,
        is_featured_lab_test: false,
        is_home_collection_available: false,
        is_active: true,
        image_url: "",
        modality_type_id: "",
        inspection_parts_ids: [],
        related_lab_test_ids: [],
      });
    }
  }, [editTest, isOpen, category_id]);

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({
        ...formData,
        preparation_instructions: [
          ...formData.preparation_instructions,
          newInstruction.trim(),
        ],
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (instruction: string) => {
    setFormData({
      ...formData,
      preparation_instructions: formData.preparation_instructions.filter(
        (inst) => inst !== instruction
      ),
    });
  };

  const handleAddCommonInstruction = (instruction: string) => {
    if (!formData.preparation_instructions.includes(instruction)) {
      setFormData({
        ...formData,
        preparation_instructions: [
          ...formData.preparation_instructions,
          instruction,
        ],
      });
    }
  };

  const handleAddPrecaution = () => {
    if (
      newPrecaution.trim() &&
      !formData.precautions.includes(newPrecaution.trim())
    ) {
      setFormData({
        ...formData,
        precautions: [...formData.precautions, newPrecaution.trim()],
      });
      setNewPrecaution("");
    }
  };

  const handleRemovePrecaution = (precaution: string) => {
    setFormData({
      ...formData,
      precautions: formData.precautions.filter((p) => p !== precaution),
    });
  };

  const handleSelectReportTime = (hours: number) => {
    setFormData({
      ...formData,
      report_time_hrs: hours,
    });
    setShowReportTimeDropdown(false);
  };

  const handleSelectModality = (modalityId: string) => {
    setFormData({
      ...formData,
      modality_type_id: modalityId,
    });
    setShowModalityDropdown(false);
  };

  const handleAddInspectionPart = (partId: string) => {
    if (!formData.inspection_parts_ids.includes(partId)) {
      setFormData({
        ...formData,
        inspection_parts_ids: [...formData.inspection_parts_ids, partId],
      });
    }
    setShowInspectionPartsDropdown(false);
  };

  const handleRemoveInspectionPart = (partId: string) => {
    setFormData({
      ...formData,
      inspection_parts_ids: formData.inspection_parts_ids.filter(
        (p) => p !== partId
      ),
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB.");
        return;
      }

      setLoading(true);

      const fileContent = await fileToBase64(file);

      const bucketName =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
          : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;

      if (!bucketName) {
        throw new Error("S3 bucket name is not configured properly.");
      }

      const uploadRequest = {
        bucketName,
        folderPath: "radiologyTest",
        fileName: file.name,
        fileContent,
      };

      const uploadRes = await uploadFile(token!, uploadRequest);

      setFormData((prev) => ({
        ...prev,
        image_url: uploadRes.result,
      }));

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const getSafeValue = (value: any, defaultValue: any = "") => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.report_time_hrs) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        code: formData.code,
        category_id: category_id,
        sample_type_ids: formData.sample_type_ids || [],
        test_params: formData.test_params || [],
        report_time_hrs: formData.report_time_hrs,
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        preparation_instructions: formData.preparation_instructions,
        precautions: formData.precautions || [],
        is_fasting_reqd: Boolean(formData.is_fasting_reqd),
        in_person_visit_reqd: Boolean(formData.in_person_visit_reqd),
        is_featured_lab_test: Boolean(formData.is_featured_lab_test),
        is_home_collection_available: Boolean(
          formData.is_home_collection_available
        ),
        is_active: Boolean(formData.is_active),
        image_url: formData.image_url || "",
        modality_type_id: formData.modality_type_id || "",
        inspection_parts_ids: formData.inspection_parts_ids || [],
        related_lab_test_ids: formData.related_lab_test_ids || [],
      };

      console.log("Submitting payload:", payload);

      if (editTest && onUpdateTest) {
        const updatePayload = {
          ...payload,
          id: editTest.id,
        };

        await updatePathologyTest(updatePayload, token);

        onUpdateTest({
          ...payload,
          id: editTest.id,
          is_deleted: editTest.is_deleted || false,
          created_by: editTest.created_by,
          updated_by: editTest.updated_by,
        });
        toast.success("Radiology test updated successfully!");
      } else {
        const response = await createPathologyTest(payload, token);

        const newTest: RadiologyTest = {
          ...payload,
          id: response.labTestId,
          is_deleted: false,
          created_by: "current-user-id",
          updated_by: "current-user-id",
        };
        onAddTest(newTest);
        toast.success("Radiology test created successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving radiology test:", error);
      toast.error(error.message || "Failed to save radiology test");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchDropdownData().then(() => {
      setFormData((prev) => ({
        name: "",
        description: "",
        code: "",
        category_id: prev.category_id,
        sample_type_ids: [],
        test_params: [],
        report_time_hrs: 0,
        cost_price: 0,
        selling_price: 0,
        preparation_instructions: [],
        precautions: [],
        is_fasting_reqd: false,
        in_person_visit_reqd: false,
        is_featured_lab_test: false,
        is_home_collection_available: false,
        is_active: true,
        image_url: "",
        modality_type_id: "",
        inspection_parts_ids: [],
        related_lab_test_ids: [],
      }));
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowReportTimeDropdown(false);
        setShowModalityDropdown(false);
        setShowInspectionPartsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-medium text-[#161D1F] mb-3">
          Upload Radiology Test Image
        </h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">
            Drag and drop your new image here or click to browse
          </p>
          <p className="text-[12px] text-gray-500 mb-4">
            (supported file format .jpg, .jpeg, .png)
          </p>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-4 py-2 bg-[#0088B1] text-white text-xs rounded-lg cursor-pointer hover:bg-[#00729A]"
          >
            Select File
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Radiology Test Name
          </label>
          <input
            type="text"
            value={getSafeValue(formData.name)}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            placeholder="Please enter Radiology Test Name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Test Code
          </label>
          <input
            type="text"
            value={getSafeValue(formData.code)}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
            placeholder="e.g., RAD00003456"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Modality Type
          </label>
          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() => setShowModalityDropdown(!showModalityDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
              disabled={loading}
            >
              <span
                className={
                  formData.modality_type_id ? "text-black" : "text-gray-600"
                }
              >
                {loading
                  ? "Loading..."
                  : formData.modality_type_id
                  ? modalityOptions.find(
                      (m) => m.id === formData.modality_type_id
                    )?.value || formData.modality_type_id
                  : "Select modality"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showModalityDropdown && !loading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {modalityOptions.length > 0 ? (
                  modalityOptions.map((modality) => (
                    <button
                      key={modality.id}
                      type="button"
                      onClick={() => handleSelectModality(modality.id)}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-400"
                    >
                      {modality.value}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">
                    No modalities available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Report Preparation Time (Hrs.)
          </label>
          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() => setShowReportTimeDropdown(!showReportTimeDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
            >
              <span
                className={
                  formData.report_time_hrs ? "text-black" : "text-gray-600"
                }
              >
                {formData.report_time_hrs
                  ? `${formData.report_time_hrs} hours`
                  : "Select time"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showReportTimeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {reportTimeOptions.map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleSelectReportTime(hours)}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-400"
                  >
                    {hours} hours
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Inspection Parts
          </label>
          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() =>
                setShowInspectionPartsDropdown(!showInspectionPartsDropdown)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
              disabled={loading}
            >
              <span className="text-gray-600">
                {loading ? "Loading..." : "Select inspection parts"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showInspectionPartsDropdown && !loading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {inspectionPartsOptions.length > 0 ? (
                  inspectionPartsOptions.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => handleAddInspectionPart(part.id)}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-400"
                    >
                      {part.value}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">
                    No inspection parts available
                  </div>
                )}
              </div>
            )}
          </div>

          {formData.inspection_parts_ids.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.inspection_parts_ids.map((partId, index) => {
                const part = inspectionPartsOptions.find(
                  (p) => p.id === partId
                );
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#0088B1] rounded-xl"
                  >
                    <span className="text-xs text-[#FFF]">
                      {part?.value || partId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInspectionPart(partId)}
                      className="text-[#FFF]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-[#161D1F] mb-4">
          Pricing Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Cost Price
            </label>
            <input
              type="number"
              value={formData.cost_price === 0 ? "" : formData.cost_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Selling Price
            </label>
            <input
              type="number"
              value={formData.selling_price === 0 ? "" : formData.selling_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  selling_price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          * Test Description
        </label>
        <textarea
          value={getSafeValue(formData.description)}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          placeholder="Briefly describe radiology test details"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          Precautions
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrecaution}
              onChange={(e) => setNewPrecaution(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
              placeholder="Add precaution"
              onKeyPress={(e) => e.key === "Enter" && handleAddPrecaution()}
            />
            <button
              type="button"
              onClick={handleAddPrecaution}
              disabled={!newPrecaution.trim()}
              className="px-3 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {formData.precautions.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Selected Precautions:
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.precautions.map((precaution, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-[#0088B1] text-white px-3 py-1.5 rounded-full"
              >
                <span className="text-xs font-medium">{precaution}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePrecaution(precaution)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          Preparation Instructions
        </label>

        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Quick add common instructions:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Fast for 8 hours before test",
              "Avoid alcohol for 24 hours before test",
              "No strenuous exercise before test",
              "Drink plenty of water before test",
              "Avoid specific medications before test",
            ].map((instruction) => (
              <button
                key={instruction}
                type="button"
                onClick={() => handleAddCommonInstruction(instruction)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
              >
                + {instruction}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
              placeholder="Add custom instruction"
              onKeyPress={(e) => e.key === "Enter" && handleAddInstruction()}
            />
            <button
              type="button"
              onClick={handleAddInstruction}
              disabled={!newInstruction.trim()}
              className="px-3 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {formData.preparation_instructions.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {formData.preparation_instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-[#0088B1] text-white px-3 py-1.5 rounded-full"
                >
                  <span className="text-xs font-medium">{instruction}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(instruction)}
                    className="text-white hover:text-gray-200 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={getSafeValue(formData.is_active, true)}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Active Radiology Test
            </h4>
            <p className="text-[12px] text-gray-500">
              Inactive tests are not displayed on the app
            </p>
          </div>
        </div>

        {/* Featured Radiology Test */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={getSafeValue(formData.is_featured_lab_test, false)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_featured_lab_test: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Featured Radiology Test
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable to feature this test on the app's homepage
            </p>
          </div>
        </div>

        {/* Home Collection Available */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={getSafeValue(formData.is_home_collection_available, false)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_home_collection_available: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Home Collection Available
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if sample can be collected at patient's home
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={getSafeValue(formData.in_person_visit_reqd, false)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                in_person_visit_reqd: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Lab/Hospital Visit Required
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if patient must visit lab/hospital for this test
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={getSafeValue(formData.is_fasting_reqd, false)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_fasting_reqd: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Fasting Requirement
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if this test requires fasting
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {editTest ? "Edit Radiology Test" : "Add New Radiology Test"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection("basic")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "basic"
                ? "bg-[#0088B1] text-[#fff]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "settings"
                ? "bg-[#0088B1] text-[#fff]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "basic" && renderBasicInformation()}
          {activeSection === "settings" && renderSettings()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
          >
            Reset
          </button>

          <div className="flex gap-3">
            {activeSection !== "basic" && (
              <button
                onClick={() => setActiveSection("basic")}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
              >
                Previous
              </button>
            )}

            {activeSection === "basic" ? (
              <button
                onClick={() => setActiveSection("settings")}
                className="px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A] ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting
                  ? "Saving..."
                  : editTest
                  ? "Update Test"
                  : "Add Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
