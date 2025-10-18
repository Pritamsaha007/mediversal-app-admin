"use client";
import React, { useEffect, useState } from "react";
import { X, Upload, Plus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { PathologyTest } from "../types";

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (test: Omit<PathologyTest, "id">) => void;
  onUpdateTest?: (test: PathologyTest) => void;
  editTest?: PathologyTest | null;
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
  const [activeSection, setActiveSection] = useState<"basic" | "settings">(
    "basic"
  );

  // Dropdown states
  const [showTestParamsDropdown, setShowTestParamsDropdown] = useState(false);
  const [showReportTimeDropdown, setShowReportTimeDropdown] = useState(false);
  const [showSampleTypeDropdown, setShowSampleTypeDropdown] = useState(false);

  // Dropdown options
  const testParameterOptions = [
    "Red Blood Cell Count (RBC)",
    "White Blood Cell Count (WBC)",
    "Haemoglobin (Hb)",
    "Hematocrit (Hct)",
    "Platelet Count",
    "Mean Corpuscular Volume (MCV)",
    "Mean Corpuscular Haemoglobin (MCH)",
    "Mean Corpuscular Hemoglobin Concentration (MCHC)",
  ];

  const reportTimeOptions = [6, 12, 16, 32, 48, 64, 72];
  const sampleTypeOptions = [
    "Blood",
    "Urine",
    "Serum",
    "Plasma",
    "Saliva",
    "Tissue",
  ];

  const commonInstructions = [
    "Fast for 8 hours before test",
    "Avoid alcohol for 24 hours before test",
    "No strenuous exercise before test",
    "Drink plenty of water before test",
    "Avoid specific medications before test",
  ];

  useEffect(() => {
    if (editTest && isOpen) {
      setFormData({
        name: editTest.name,
        description: editTest.description,
        code: editTest.code,
        category_id: editTest.category_id,
        sample_type_ids: editTest.sample_type_ids || [],
        test_params: editTest.test_params || [],
        report_time_hrs: editTest.report_time_hrs,
        cost_price: editTest.cost_price,
        selling_price: editTest.selling_price,
        preparation_instructions: editTest.preparation_instructions,
        precautions: editTest.precautions || [],
        is_fasting_reqd: editTest.is_fasting_reqd,
        in_person_visit_reqd: editTest.in_person_visit_reqd,
        is_featured_lab_test: editTest.is_featured_lab_test,
        is_home_collection_available: editTest.is_home_collection_available,
        is_active: editTest.is_active,
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
        category_id: "",
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
  }, [editTest, isOpen]);

  const handleAddInstruction = () => {
    if (
      newInstruction.trim() &&
      !formData.preparation_instructions.includes(newInstruction.trim())
    ) {
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

  const handleAddTestParameter = (parameter: string) => {
    if (!formData.test_params.includes(parameter)) {
      setFormData({
        ...formData,
        test_params: [...formData.test_params, parameter],
      });
    }
    setShowTestParamsDropdown(false);
  };

  const handleRemoveParameter = (param: string) => {
    setFormData({
      ...formData,
      test_params: formData.test_params.filter((p) => p !== param),
    });
  };

  const handleAddSampleType = (sampleType: string) => {
    if (!formData.sample_type_ids.includes(sampleType)) {
      setFormData({
        ...formData,
        sample_type_ids: [...formData.sample_type_ids, sampleType],
      });
    }
    setShowSampleTypeDropdown(false);
  };

  const handleRemoveSampleType = (sampleType: string) => {
    setFormData({
      ...formData,
      sample_type_ids: formData.sample_type_ids.filter((s) => s !== sampleType),
    });
  };

  const handleSelectReportTime = (hours: number) => {
    setFormData({
      ...formData,
      report_time_hrs: hours,
    });
    setShowReportTimeDropdown(false);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      toast.success("Image uploaded successfully");
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.report_time_hrs) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editTest && onUpdateTest) {
      onUpdateTest({
        ...formData,
        id: editTest.id,
        is_deleted: editTest.is_deleted || false,
        created_by: editTest.created_by,
        updated_by: editTest.updated_by,
      });
    } else {
      onAddTest({
        ...formData,
        is_deleted: false,
        created_by: "current-user-id",
        updated_by: "current-user-id",
      });
    }
    onClose();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      category_id: "",
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
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowTestParamsDropdown(false);
        setShowReportTimeDropdown(false);
        setShowSampleTypeDropdown(false);
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
          Upload Lab Test Image
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
            * Lab Test Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            placeholder="Please enter Test Name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Test Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
            placeholder="e.g., CBC00003456"
          />
        </div>
      </div>

      {/* Sample Type, Report Time, and Preparation in same row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sample Type */}
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Sample Type
          </label>
          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() => setShowSampleTypeDropdown(!showSampleTypeDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
            >
              <span className="text-gray-600">Select sample type</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showSampleTypeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {sampleTypeOptions.map((sampleType) => (
                  <button
                    key={sampleType}
                    type="button"
                    onClick={() => handleAddSampleType(sampleType)}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-400"
                  >
                    {sampleType}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Sample Types */}
          {formData.sample_type_ids.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.sample_type_ids.map((sampleType, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#0088B1] rounded-xl"
                >
                  <span className="text-xs text-[#FFF]">{sampleType}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSampleType(sampleType)}
                    className="text-[#FFF]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Time */}
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

        {/* Test Parameters Section */}
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            Test Parameters
          </label>
          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() => setShowTestParamsDropdown(!showTestParamsDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-left bg-white flex items-center justify-between"
            >
              <span className="text-gray-600">Select test parameters</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showTestParamsDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {testParameterOptions.map((parameter) => (
                  <button
                    key={parameter}
                    type="button"
                    onClick={() => handleAddTestParameter(parameter)}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-400"
                  >
                    {parameter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Parameters */}
          {formData.test_params.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.test_params.map((parameter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#0088B1] rounded-xl"
                >
                  <span className="text-xs text[#FFF]">{parameter}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParameter(parameter)}
                    className="text-[#FFF]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Pricing and Description sections remain the same */}
      <div className="p-4 rounded-lg">
        <h4 className="text-xs font-medium text-[#161D1F] mb-4">
          Pricing Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Cost Price ($)
            </label>
            <input
              type="number"
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Selling Price ($)
            </label>
            <input
              type="number"
              value={formData.selling_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  selling_price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          * Test Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          placeholder="Briefly describe test details"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#161D1F]">
          Preparation Instructions
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="textarea"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
              placeholder="Add custom instruction"
              onKeyPress={(e) => e.key === "Enter" && handleAddInstruction()}
            />
            <button
              type="button"
              onClick={handleAddInstruction}
              className="px-3 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Selected Preparation Instructions */}
      {formData.preparation_instructions.length > 0 && (
        <div>
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
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Settings remain the same */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Home Collection */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Home Collection Available
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if sample can be collected at patient's home
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_home_collection_available}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_home_collection_available: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088B1]"></div>
          </label>
        </div>

        {/* Active Lab Test */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Active Lab Test
            </h4>
            <p className="text-[12px] text-gray-500">
              Inactive tests are not displayed on the app
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088B1]"></div>
          </label>
        </div>

        {/* Fasting Required */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Fasting Required
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if this test requires patients to fast before sample
              collection
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_fasting_reqd}
              onChange={(e) =>
                setFormData({ ...formData, is_fasting_reqd: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088B1]"></div>
          </label>
        </div>

        {/* Lab Visit Required */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Lab/Hospital Visit Required
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if patient must visit lab/hospital for this test
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.in_person_visit_reqd}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  in_person_visit_reqd: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088B1]"></div>
          </label>
        </div>

        {/* Featured Lab Test */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg sm:col-span-2">
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Featured Lab Test
            </h4>
            <p className="text-[12px] text-gray-500">
              Featured tests are displayed prominently on the app
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured_lab_test}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_featured_lab_test: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088B1]"></div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[16px] font-semibold text-[#161D1F]">
            {editTest ? "Edit Lab Test" : "Add New Lab Test"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-[#899193]" />
          </button>
        </div>

        {/* Navigation Tabs */}
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
                className="px-6 py-2 bg-[#0088B1] text-white rounded-lg text-xs hover:bg-[#00729A]"
              >
                {editTest ? "Update Test" : "Add Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
