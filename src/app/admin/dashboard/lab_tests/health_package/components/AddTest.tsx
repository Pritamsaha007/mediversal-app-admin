"use client";
import React, { useEffect, useState } from "react";
import { X, Upload, Plus, ChevronDown, Search } from "lucide-react";
import toast from "react-hot-toast";
import { HealthPackagesType } from "../types";

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (test: Omit<HealthPackagesType, "id">) => void;
  onUpdateTest?: (test: HealthPackagesType) => void;
  editTest?: HealthPackagesType | null;
}

interface TestItem {
  id: string;
  name: string;
  category: string;
  sampleType: string;
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
    test_includes: [] as string[],
    report_time_hrs: 0,
    cost_price: 0,
    selling_price: 0,
    discounted_price: 0,
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

  const [activeSection, setActiveSection] = useState<"basic" | "settings">(
    "basic"
  );
  const [showReportTimeDropdown, setShowReportTimeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Pathology");

  // Mock data for available tests
  const availableTests: TestItem[] = [
    {
      id: "LFT0007890",
      name: "Complete Blood Count (CBC)",
      category: "Pathology",
      sampleType: "Serum, Plasma",
    },
    {
      id: "KFT0012345",
      name: "Kidney Function Test",
      category: "Pathology",
      sampleType: "Serum, Urine",
    },
    {
      id: "BGT0023456",
      name: "Blood Glucose Test",
      category: "Pathology",
      sampleType: "Plasma, Capillary",
    },
    {
      id: "LFT0034567",
      name: "Liver Function Test",
      category: "Pathology",
      sampleType: "Serum",
    },
    {
      id: "TFT0045678",
      name: "Thyroid Function Test",
      category: "Pathology",
      sampleType: "Serum",
    },
    {
      id: "LIP0056789",
      name: "Lipid Profile",
      category: "Pathology",
      sampleType: "Serum",
    },
    {
      id: "XRAY001234",
      name: "Chest X-Ray",
      category: "Radiology",
      sampleType: "N/A",
    },
    {
      id: "USG002345",
      name: "Abdominal Ultrasound",
      category: "Radiology",
      sampleType: "N/A",
    },
    { id: "ECG003456", name: "ECG", category: "Cardiology", sampleType: "N/A" },
    {
      id: "ECHO004567",
      name: "Echocardiogram",
      category: "Cardiology",
      sampleType: "N/A",
    },
    {
      id: "STRESS005678",
      name: "Stress Test",
      category: "Cardiology",
      sampleType: "N/A",
    },
    {
      id: "MRI006789",
      name: "MRI Scan",
      category: "Radiology",
      sampleType: "N/A",
    },
    {
      id: "CT007890",
      name: "CT Scan",
      category: "Radiology",
      sampleType: "N/A",
    },
  ];

  const reportTimeOptions = [6, 12, 16, 24, 32, 48, 64, 72];
  const categories = ["Pathology", "Radiology"];

  useEffect(() => {
    if (editTest && isOpen) {
      setFormData({
        name: editTest.name,
        description: editTest.description,
        code: editTest.code,
        category_id: editTest.category_id,
        sample_type_ids: editTest.sample_type_ids || [],
        test_includes: editTest.test_includes || [],
        report_time_hrs: editTest.report_time_hrs,
        cost_price: editTest.cost_price,
        selling_price: editTest.selling_price,
        discounted_price: editTest.selling_price * 0.9,
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

      // Set selected tests based on edit data
      const selected = availableTests.filter((test) =>
        editTest.test_includes?.some((includedTest) =>
          includedTest.toLowerCase().includes(test.name.toLowerCase())
        )
      );
      setSelectedTests(selected);
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        code: "",
        category_id: "",
        sample_type_ids: [],
        test_includes: [],
        report_time_hrs: 0,
        cost_price: 0,
        selling_price: 0,
        discounted_price: 0,
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
      setSelectedTests([]);
    }
  }, [editTest, isOpen]);

  const handleSelectReportTime = (hours: number) => {
    setFormData({
      ...formData,
      report_time_hrs: hours,
    });
    setShowReportTimeDropdown(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image_url: imageUrl,
      });
      toast.success("Image uploaded successfully");
    }
  };

  const handleAddTest = (test: TestItem) => {
    if (!selectedTests.some((t) => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== testId));
  };

  const filteredTests = availableTests.filter(
    (test) =>
      (activeCategory === "All" || test.category === activeCategory) &&
      (test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.report_time_hrs) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedTests.length === 0) {
      toast.error("Please select at least one test for the package");
      return;
    }

    // Convert selected tests to test_includes format
    const testIncludes = selectedTests.map((test) => test.name);

    const submitData = {
      ...formData,
      test_includes: testIncludes,
    };

    if (editTest && onUpdateTest) {
      onUpdateTest({
        ...submitData,
        id: editTest.id,
        is_deleted: editTest.is_deleted || false,
        created_by: editTest.created_by,
        updated_by: editTest.updated_by,
      });
    } else {
      onAddTest({
        ...submitData,
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
      test_includes: [],
      report_time_hrs: 0,
      cost_price: 0,
      selling_price: 0,
      discounted_price: 0,
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
    setSelectedTests([]);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowReportTimeDropdown(false);
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
      {/* Image Upload */}
      <div>
        <h4 className="text-xs font-medium text-[#161D1F] mb-3">
          Upload Health Package Image
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

      {/* Health Package Name and Report Preparation Time in same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Package Name */}
        <div>
          <label className="block text-xs font-medium text-[#161D1F] mb-2">
            * Health Package Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
            placeholder="Please enter Package Name"
          />
        </div>

        {/* Report Preparation Time */}
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
                  : "e.g., 6, 12, 32"}
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
      </div>

      {/* Select Tests Section */}
      <div>
        <h4 className="text-xs font-medium text-[#161D1F] mb-3">
          Select tests to include
        </h4>

        {/* Search Bar */}

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCategory === category
                  ? "bg-black text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Lab Tests, Diagnostics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          />
        </div>

        {/* Tests Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#161D1F]">
                      {test.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Test ID: {test.id} | {test.sampleType}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTest(test)}
                    disabled={selectedTests.some((t) => t.id === test.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                      selectedTests.some((t) => t.id === test.id)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "text-[#0088B1] hover:bg-[#00729A]"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-[#161D1F] mb-2">
              Selected: {selectedTests.length} tests...
            </div>
            <div className="space-y-2">
              {selectedTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="text-xs font-medium text-[#161D1F]">
                      {test.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Test ID: {test.id} | {test.category}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(test.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Pricing Details */}
      <div className="p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-[#161D1F] mb-4">
          Pricing Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Selling Price (€)
            </label>
            <input
              type="number"
              value={formData.selling_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  selling_price: parseFloat(e.target.value) || 0,
                  discounted_price: parseFloat(e.target.value) * 0.9, // Auto-calculate 10% discount
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#161D1F] mb-2">
              Discounted Price (€)
            </label>
            <input
              type="number"
              value={formData.discounted_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discounted_price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-600"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Package Description */}
      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          Package Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          placeholder="Briefly describe package details"
        />
      </div>

      {/* Preparation Instructions */}
      <div>
        <label className="block text-xs font-medium text-[#161D1F] mb-2">
          Preparation Instructions
        </label>
        <textarea
          value={formData.preparation_instructions.join("\n")}
          onChange={(e) =>
            setFormData({
              ...formData,
              preparation_instructions: e.target.value
                .split("\n")
                .filter((line) => line.trim()),
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          placeholder="Specify some health package preparation instructions/notes"
        />
      </div>

      {/* Toggle Settings - Checkbox Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Health Package */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_active: e.target.checked,
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Active Health Package
            </h4>
            <p className="text-[12px] text-gray-500">
              Inactive packages are not displayed on the app
            </p>
          </div>
        </div>

        {/* Popular Health Package */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_featured_lab_test}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_featured_lab_test: e.target.checked,
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Popular Health Package
            </h4>
            <p className="text-[12px] text-gray-500">
              Popular packages are displayed prominently on the app
            </p>
          </div>
        </div>

        {/* Home Collection Available */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_home_collection_available}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_home_collection_available: e.target.checked,
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
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

        {/* Lab/Hospital Visit Required */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.in_person_visit_reqd}
            onChange={(e) =>
              setFormData({
                ...formData,
                in_person_visit_reqd: e.target.checked,
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Lab/Hospital Visit Required
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if patient must visit lab/hospital for this health package
            </p>
          </div>
        </div>

        {/* Fasting Requirement */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_fasting_reqd}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_fasting_reqd: e.target.checked,
              })
            }
            className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Fasting Requirement
            </h4>
            <p className="text-[12px] text-gray-500">
              Enable if this package requires fasting
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
            {editTest ? "Edit Health Package" : "Add New Health Package"}
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
                {editTest ? "Update Package" : "Add Package"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
