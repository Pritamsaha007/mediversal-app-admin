"use client";
import React, { useEffect, useState } from "react";
import { X, Upload, Plus, ChevronDown, Search } from "lucide-react";
import toast from "react-hot-toast";

import { useAdminStore } from "@/app/store/adminStore";
import {
  createHealthPackage,
  updateHealthPackage,
  uploadFile,
  searchPathologyTests,
  fetchCategories,
} from "../../services/index";
import { PathologyTest } from "../../pathology_tests/types";
import { HealthPackage } from "../types";

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (test: HealthPackage) => void;
  onUpdateTest?: (test: HealthPackage) => void;
  editTest?: HealthPackage | null;
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
    image_url: "",
    linked_test_ids: [] as string[],
    cost_price: 0,
    selling_price: 0,
    preparation_instructions: [] as string[],
    is_active: true,
    is_popular: false,
    is_deleted: false,
    related_health_package_ids: [] as string[],
    is_fasting_reqd: false,
    in_person_visit_reqd: false,
    is_home_collection_available: true,
  });

  const [activeSection, setActiveSection] = useState<"basic" | "settings">(
    "basic"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState<PathologyTest[]>([]);
  const [availableTests, setAvailableTests] = useState<PathologyTest[]>([]);
  const [allAvailableTests, setAllAvailableTests] = useState<PathologyTest[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Pathology");
  const { token } = useAdminStore();

  const fetchAllAvailableTests = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const categoryData = await fetchCategories(token);
      const pathologyId = categoryData.roles[2]?.id || "";
      const radiologyId = categoryData.roles[11]?.id || "";

      const pathologyPayload = {
        start: 0,
        max: 100,
        search_category: pathologyId,
        search: searchTerm || null,
        filter_sample_type_ids: null,
        filter_active: true,
        filter_featured: null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const radiologyPayload = {
        start: 0,
        max: 100,
        search_category: radiologyId,
        search: searchTerm || null,
        filter_sample_type_ids: null,
        filter_active: true,
        filter_featured: null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const [pathologyResponse, radiologyResponse] = await Promise.all([
        searchPathologyTests(pathologyPayload, token),
        searchPathologyTests(radiologyPayload, token),
      ]);

      const allTests = [
        ...(pathologyResponse.labTests || []),
        ...(radiologyResponse.labTests || []),
      ];

      setAllAvailableTests(allTests);

      const filteredTests = allTests.filter((test) =>
        activeCategory === "Pathology"
          ? test.category_id === pathologyId
          : test.category_id === radiologyId
      );

      setAvailableTests(filteredTests);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      toast.error("Failed to load lab tests");
    } finally {
      setLoading(false);
    }
  };

  const filterAvailableTestsByCategory = () => {
    if (!token || allAvailableTests.length === 0) return;

    const categoryData = fetchCategories(token).then((categoryData) => {
      const pathologyId = categoryData.roles[2]?.id || "";
      const radiologyId = categoryData.roles[11]?.id || "";

      const filteredTests = allAvailableTests.filter((test) =>
        activeCategory === "Pathology"
          ? test.category_id === pathologyId
          : test.category_id === radiologyId
      );

      setAvailableTests(filteredTests);
    });
  };
  useEffect(() => {
    if (isOpen && token) {
      fetchAllAvailableTests();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (searchTerm) {
      const delaySearch = setTimeout(() => {
        const categoryData = fetchCategories(token!).then((categoryData) => {
          const pathologyId = categoryData.roles[2]?.id || "";
          const radiologyId = categoryData.roles[11]?.id || "";

          const filteredTests = allAvailableTests.filter((test) => {
            const matchesSearch =
              test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              test.code.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
              activeCategory === "Pathology"
                ? test.category_id === pathologyId
                : test.category_id === radiologyId;

            return matchesSearch && matchesCategory;
          });

          setAvailableTests(filteredTests);
        });
      }, 500);

      return () => clearTimeout(delaySearch);
    } else {
      filterAvailableTestsByCategory();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (activeCategory && allAvailableTests.length > 0) {
      filterAvailableTestsByCategory();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (editTest && isOpen && allAvailableTests.length > 0) {
      setFormData({
        name: editTest.name || "",
        description: editTest.description || "",
        image_url: editTest.image_url || "",
        linked_test_ids: editTest.linked_test_ids || [],
        cost_price: editTest.cost_price || 0,
        selling_price: editTest.selling_price || 0,
        preparation_instructions: editTest.prepare_instructions || [],
        is_active: editTest.is_active !== undefined ? editTest.is_active : true,
        is_popular: editTest.is_popular || false,
        is_deleted: editTest.is_deleted || false,

        related_health_package_ids: editTest.related_health_package_ids || [],
        is_fasting_reqd: editTest.is_fasting_reqd || false,
        in_person_visit_reqd: editTest.in_person_visit_reqd || false,
        is_home_collection_available:
          editTest.is_home_collection_available !== undefined &&
          editTest.is_home_collection_available !== null
            ? editTest.is_home_collection_available
            : true,
      });

      if (editTest.linked_test_ids && editTest.linked_test_ids.length > 0) {
        const selected = allAvailableTests.filter((test) =>
          editTest.linked_test_ids?.includes(test.id)
        );
        setSelectedTests(selected);
      }
      if (editTest.image_url) {
        setImagePreview(editTest.image_url);
      }
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        image_url: "",
        linked_test_ids: [],
        cost_price: 0,
        selling_price: 0,
        preparation_instructions: [],
        is_active: true,
        is_popular: false,
        is_deleted: false,

        related_health_package_ids: [],
        is_fasting_reqd: false,
        in_person_visit_reqd: false,
        is_home_collection_available: true,
      });
      setSelectedTests([]);
      setSearchTerm("");
      setImagePreview("");
      setImageFile(null);
    }
  }, [editTest, isOpen, allAvailableTests]);
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      setFormData((prev) => ({
        ...prev,
        image_url: "",
      }));

      toast.success("Image selected for upload");
    } catch (error: any) {
      console.error("Image selection failed:", error);
      toast.error(error.message || "Failed to select image");
    }
  };
  const uploadImageAndGetUrl = async (): Promise<string> => {
    if (!imageFile) {
      return formData.image_url;
    }

    try {
      setLoading(true);

      const fileUri = URL.createObjectURL(imageFile);
      const fileContent = await fileToBase64(fileUri);

      const bucketName =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
          : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;

      if (!bucketName) {
        throw new Error("S3 bucket name is not configured properly.");
      }

      const uploadRequest = {
        bucketName,
        folderPath: "healthPackages",
        fileName: imageFile.name,
        fileContent,
      };

      const uploadRes = await uploadFile(token!, uploadRequest);

      URL.revokeObjectURL(fileUri);

      return uploadRes.result;
    } catch (error: any) {
      console.error("Image upload failed:", error);
      throw new Error(error.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = async (fileUri: string): Promise<string> => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      throw error;
    }
  };
  const handleAddTest = (test: PathologyTest) => {
    if (!selectedTests.some((t) => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
      setFormData((prev) => ({
        ...prev,
        linked_test_ids: [...prev.linked_test_ids, test.id],
      }));
    }
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== testId));
    setFormData((prev) => ({
      ...prev,
      linked_test_ids: prev.linked_test_ids.filter((id) => id !== testId),
    }));
  };

  const isTestSelected = (testId: string) => {
    return selectedTests.some((test) => test.id === testId);
  };

  const handleAddInstruction = () => {
    const instruction = document.getElementById(
      "instruction-input"
    ) as HTMLInputElement;
    if (instruction?.value.trim()) {
      setFormData({
        ...formData,
        preparation_instructions: [
          ...formData.preparation_instructions,
          instruction.value.trim(),
        ],
      });
      instruction.value = "";
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedTests.length === 0) {
      toast.error("Please select at least one test for the package");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        try {
          imageUrl = await uploadImageAndGetUrl();
        } catch (uploadError: any) {
          toast.error("Failed to upload image: " + uploadError.message);
          return;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl,
        linked_test_ids: formData.linked_test_ids,
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        preparation_instructions: formData.preparation_instructions,
        is_active: Boolean(formData.is_active),
        is_popular: Boolean(formData.is_popular),
        is_deleted: Boolean(formData.is_deleted),

        related_health_package_ids: formData.related_health_package_ids,
        is_fasting_reqd: Boolean(formData.is_fasting_reqd),
        in_person_visit_reqd: Boolean(formData.in_person_visit_reqd),
        is_home_collection_available: Boolean(
          formData.is_home_collection_available
        ),
      };

      console.log("Submitting health package:", payload);

      if (editTest && onUpdateTest) {
        const updatePayload = {
          id: editTest.id,
          ...payload,
          prepare_instructions: payload.preparation_instructions,
        };

        const response = await updateHealthPackage(updatePayload, token);
        onUpdateTest(updatePayload as HealthPackage);
        toast.success("Health package updated successfully!");
      } else {
        const response = await createHealthPackage(
          {
            ...payload,
            prepare_instructions: payload.preparation_instructions,
          },
          token
        );

        const newPackage: HealthPackage = {
          id: response.healthPackageId,
          ...payload,
          prepare_instructions: payload.preparation_instructions,
        };
        onAddTest(newPackage);
        toast.success("Health package created successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving health package:", error);
      toast.error(error.message || "Failed to save health package");
    } finally {
      setSubmitting(false);
    }
  };
  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      linked_test_ids: [],
      cost_price: 0,
      selling_price: 0,
      preparation_instructions: [],
      is_active: true,
      is_popular: false,
      is_deleted: false,

      related_health_package_ids: [],
      is_fasting_reqd: false,
      in_person_visit_reqd: false,
      is_home_collection_available: true,
    });

    setImagePreview("");
    setImageFile(null);
    setSelectedTests([]);
    setSearchTerm("");
  };

  const categories = ["Pathology", "Radiology"];

  if (!isOpen) return null;

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-medium text-[#161D1F] mb-3">
          Upload Health Package Image
        </h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0088B1] transition-colors">
          {imagePreview ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <img
                  src={imagePreview}
                  alt="Test preview"
                  className="w-48 h-32 object-contain border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImageFile(null);
                    setFormData({ ...formData, image_url: "" });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {imageFile ? "Image ready for upload" : "Image uploaded"}{" "}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-xs text-gray-600 mb-2">
                Drag and drop your new image here or click to browse
              </p>
              <p className="text-[12px] text-gray-500 mb-4">
                (supported file format .jpg, .jpeg, .png)
              </p>
            </div>
          )}

          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageSelect}
          />
          <label
            htmlFor="image-upload"
            className={`inline-block px-4 py-2 ${
              imagePreview
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-[#0088B1] text-white hover:bg-[#00729A]"
            } text-xs rounded-lg cursor-pointer transition-colors`}
          >
            {imagePreview ? "Change Image" : "Select File"}
          </label>
        </div>
      </div>

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

      <div>
        <h4 className="text-xs font-medium text-[#161D1F] mb-3">
          Select tests to include
        </h4>

        <div className="flex border-b border-gray-200 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCategory === category
                  ? "bg-[#4A5254] text-white rounded-md"
                  : "border-transparent text-gray-500  hover:text-gray-700"
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

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-500">
                Loading tests...
              </div>
            ) : availableTests.length > 0 ? (
              availableTests.map((test) => (
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
                        Code: {test.code} | Report Time: {test.report_time_hrs}{" "}
                        hrs
                      </div>
                      {test.sample_type_ids &&
                        test.sample_type_ids.length > 0 && (
                          <div className="text-[10px] text-gray-500">
                            Sample: {test.sample_type_ids.join(", ")}
                          </div>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTest(test)}
                      disabled={isTestSelected(test.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                        isTestSelected(test.id)
                          ? "text-gray-300  cursor-not-allowed"
                          : "text-[#0088B1] "
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">
                No tests found
              </div>
            )}
          </div>
        </div>

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
                      Code: {test.code} | Price: ₹{test.selling_price}
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
          * Package Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          placeholder="Briefly describe package details and benefits"
        />
      </div>

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
              "Fast for 8-12 hours before the test",
              "Avoid alcohol for 24 hours before the test",
              "No strenuous exercise before the test",
              "Drink plenty of water before the test",
              "Continue prescribed medications unless instructed otherwise",
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
              id="instruction-input"
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
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
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_active: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
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

        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_popular}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_popular: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
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
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_fasting_reqd}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_fasting_reqd: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Fasting Required
            </h4>
            <p className="text-[10px] text-gray-500">
              Patient needs to fast before test
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.in_person_visit_reqd}
            onChange={(e) =>
              setFormData({
                ...formData,
                in_person_visit_reqd: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              In-person Visit Required
            </h4>
            <p className="text-[10px] text-gray-500">
              Patient must visit facility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            checked={formData.is_home_collection_available}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_home_collection_available: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
          />
          <div>
            <h4 className="text-xs font-medium text-[#161D1F]">
              Home Collection Available
            </h4>
            <p className="text-[10px] text-gray-500">
              Sample collection at home
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

        <div className="flex border-b border-gray-200 px-5">
          <button
            onClick={() => setActiveSection("basic")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "basic"
                ? "bg-[#0088B1] rounded-md text-[#fff]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === "settings"
                ? "bg-[#0088B1] rounded-md text-[#fff]"
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
                  ? "Update Package"
                  : "Add Package"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
