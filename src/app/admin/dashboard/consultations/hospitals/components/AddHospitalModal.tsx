"use client";
import React, { useEffect, useState } from "react";
import { X, ImagePlus, Search, Plus } from "lucide-react";
import { tabs } from "../utils";
import { getEnumValues, addOrUpdateHospital } from "../services";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import { PathologyTest } from "../../../lab_tests/pathology_tests/types";
import { HealthPackage } from "../../../lab_tests/health_package/types";
import {
  fetchCategories,
  searchHeathPackages,
  searchPathologyTests,
} from "../../../lab_tests/services";
import { EnumItem, Hospital, HospitalFormData } from "../types";

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHospital: (hospitalData: Hospital) => void;
  editingHospital?: Hospital | null;
}

const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  isOpen,
  onClose,
  onAddHospital,
  editingHospital,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Hospital>({
    id: "",
    name: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      landmark: "",
    },
    contact: {
      phone: [],
      email: [],
      website: "",
    },
    description: "",
    departments: [],
    lab_test_ids: [],
    health_package_ids: [],
    operatingHours: {
      Monday: { startTime: "09:00", endTime: "17:00" },
      Tuesday: { startTime: "09:00", endTime: "17:00" },
      Wednesday: { startTime: "09:00", endTime: "17:00" },
      Thursday: { startTime: "09:00", endTime: "17:00" },
      Friday: { startTime: "09:00", endTime: "17:00" },
      Saturday: { startTime: "09:00", endTime: "17:00" },
      Sunday: { startTime: "09:00", endTime: "17:00" },
    },
    emergencyServices: false,
    image: null,
  });

  const [enumDays, setEnumDays] = useState<EnumItem[]>([]);
  const [enumDepartments, setEnumDepartments] = useState<EnumItem[]>([]);
  const [enumStates, setEnumStates] = useState<EnumItem[]>([]);
  const [enumLoading, setEnumLoading] = useState(true);
  const { token } = useAdminStore();

  const [activeCategory, setActiveCategory] = useState("Pathology Tests");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTests, setAvailableTests] = useState<PathologyTest[]>([]);
  const [availablePackages, setAvailablePackages] = useState<HealthPackage[]>(
    []
  );
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [allPathologyTests, setAllPathologyTests] = useState<PathologyTest[]>(
    []
  );
  const [allRadiologyTests, setAllRadiologyTests] = useState<PathologyTest[]>(
    []
  );
  const [allHealthPackages, setAllHealthPackages] = useState<HealthPackage[]>(
    []
  );
  const [contactInputs, setContactInputs] = useState({
    phone: "",
    email: "",
    website: "",
  });

  const convertDepartmentsToIds = (
    departments: string[],
    enumDepartments: EnumItem[]
  ): string[] => {
    if (!Array.isArray(departments)) {
      return [];
    }

    return departments
      .map((dept) => {
        if (!dept || typeof dept !== "string") {
          return dept || "";
        }

        if (
          dept.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          return dept;
        }

        const deptEnum = enumDepartments.find((d) => d.value === dept);
        return deptEnum?.id || dept;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (
      editingHospital &&
      enumDepartments.length > 0 &&
      enumStates.length > 0
    ) {
      const stateEnum = enumStates.find(
        (s) => s.value === editingHospital.address.state
      );

      const departmentIds = convertDepartmentsToIds(
        editingHospital.departments,
        enumDepartments
      );

      setFormData({
        ...editingHospital,
        address: {
          ...editingHospital.address,
          state: stateEnum?.id || editingHospital.address.state,
        },
        departments: departmentIds,
        image: editingHospital.image || null,
      });
      setContactInputs({
        phone: editingHospital.contact.phone[0] || "",
        email: editingHospital.contact.email[0] || "",
        website: editingHospital.contact.website || "",
      });
    }
  }, [editingHospital, enumDepartments, enumStates]);

  useEffect(() => {
    if (!editingHospital && isOpen) {
      resetForm();
    }
  }, [editingHospital, isOpen]);

  useEffect(() => {
    const loadEnumData = async () => {
      if (!token) return;
      setEnumLoading(true);
      try {
        const [days, departments, states] = await Promise.all([
          getEnumValues("DAYS_IN_WEEK", token),
          getEnumValues("DOC_DEPARTMENT", token),
          getEnumValues("INDIAN_STATES", token),
        ]);

        setEnumDays(days);
        setEnumDepartments(departments);
        setEnumStates(states);
      } catch (error) {
        console.error("Error loading enum data:", error);
        setEnumDays([]);
        setEnumDepartments([]);
        setEnumStates([]);
      } finally {
        setEnumLoading(false);
      }
    };

    if (isOpen) {
      loadEnumData();

      fetchAvailableTests();
      fetchAvailablePackages();
    }
  }, [isOpen, token]);

  const fetchAvailableTests = async () => {
    if (!token) return;
    setLoadingTests(true);
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

      const pathologyTests = pathologyResponse.labTests || [];
      const radiologyTests = radiologyResponse.labTests || [];

      setAllPathologyTests(pathologyTests);
      setAllRadiologyTests(radiologyTests);

      if (activeCategory === "Pathology Tests") {
        setAvailableTests(pathologyTests);
      } else if (activeCategory === "Radiology Tests") {
        setAvailableTests(radiologyTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchAvailablePackages = async () => {
    if (!token) return;
    setLoadingPackages(true);
    try {
      const payload = {
        start: 0,
        max: 100,
        search: searchTerm || null,
        filter_active: true,
        filter_popular: null,
        sort_by: "name",
        sort_order: "ASC" as const,
      };

      const response = await searchHeathPackages(payload, token);
      const packages = response.healthpackages || [];

      setAllHealthPackages(packages);
      setAvailablePackages(packages);
    } catch (error) {
      console.error("Error fetching health packages:", error);
      toast.error("Failed to load health packages");
    } finally {
      setLoadingPackages(false);
    }
  };
  const allAvailableTests = [...allPathologyTests, ...allRadiologyTests];

  const selectedTests = allAvailableTests.filter((test) =>
    formData.lab_test_ids.includes(test.id)
  );

  const selectedPackages = allHealthPackages.filter((pkg) =>
    formData.health_package_ids.includes(pkg.id)
  );
  useEffect(() => {
    if (searchTerm) {
      const delaySearch = setTimeout(() => {
        if (activeCategory === "Health Packages") {
          fetchAvailablePackages();
        } else {
          fetchAvailableTests();
        }
      }, 500);

      return () => clearTimeout(delaySearch);
    } else if (isOpen && token) {
      if (activeCategory === "Health Packages") {
        fetchAvailablePackages();
      } else {
        fetchAvailableTests();
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    if (activeCategory && token && isOpen) {
      if (activeCategory === "Health Packages") {
        setAvailablePackages(allHealthPackages);
      } else if (activeCategory === "Pathology Tests") {
        setAvailableTests(allPathologyTests);
      } else if (activeCategory === "Radiology Tests") {
        setAvailableTests(allRadiologyTests);
      }
    }
  }, [activeCategory]);

  const handleAddTest = (test: PathologyTest) => {
    if (!formData.lab_test_ids.includes(test.id)) {
      setFormData((prev) => ({
        ...prev,
        lab_test_ids: [...prev.lab_test_ids, test.id],
      }));
    }
  };

  const handleRemoveTest = (testId: string) => {
    setFormData((prev) => ({
      ...prev,
      lab_test_ids: prev.lab_test_ids.filter((id) => id !== testId),
    }));
  };

  const isTestSelected = (testId: string) => {
    return formData.lab_test_ids.includes(testId);
  };

  const handleAddPackage = (pkg: HealthPackage) => {
    if (!formData.health_package_ids.includes(pkg.id)) {
      setFormData((prev) => ({
        ...prev,
        health_package_ids: [...prev.health_package_ids, pkg.id],
      }));
    }
  };

  const handleRemovePackage = (packageId: string) => {
    setFormData((prev) => ({
      ...prev,
      health_package_ids: prev.health_package_ids.filter(
        (id) => id !== packageId
      ),
    }));
  };

  const isPackageSelected = (packageId: string) => {
    return formData.health_package_ids.includes(packageId);
  };

  const handleInputChange = (field: string, value: any, nested?: string) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [field]:
          typeof prev[field as keyof Hospital] === "object" &&
          prev[field as keyof Hospital] !== null
            ? { ...(prev[field as keyof Hospital] as object), [nested]: value }
            : { [nested]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayToggle = (field: keyof Hospital, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter((item) => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const handleFileUpload = (field: keyof Hospital, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleContactInputChange = (field: string, value: string) => {
    setContactInputs((prev) => ({ ...prev, [field]: value }));
  };

  const addContactInfo = (type: "phone" | "email" | "website") => {
    const value = contactInputs[type].trim();
    if (!value) return;

    if (type === "website") {
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, website: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [type]: [...prev.contact[type], value],
        },
      }));
    }

    setContactInputs((prev) => ({ ...prev, [type]: "" }));
  };

  const handleOperatingHoursChange = (
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { ...prev.operatingHours[day], [field]: value },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!token) return;

    try {
      const allDaysOperatingHours = enumDays.map((dayEnum) => {
        const existingHours = formData.operatingHours[dayEnum.value];
        const operatingHour: any = {
          day_id: dayEnum.id,
          start_time: existingHours?.startTime || "00:00",
          end_time: existingHours?.endTime || "00:00",
        };

        if (editingHospital && existingHours?.id) {
          operatingHour.id = existingHours.id;
        } else if (editingHospital) {
          operatingHour.hospital_id = editingHospital.id;
        }

        return operatingHour;
      });

      const apiData: HospitalFormData = {
        ...(editingHospital?.id && { id: editingHospital.id }),
        name: formData.name,
        description: formData.description,
        display_pic:
          typeof formData.image === "string" ? formData.image : undefined,
        address_line1: formData.address.line1,
        address_line2: formData.address.line2,
        city: formData.address.city,
        landmark: formData.address.landmark,
        state_id: formData.address.state,
        pincode: formData.address.pinCode,
        country: formData.address.country,
        is_available_24_7: formData.emergencyServices,
        contact: formData.contact.phone[0] || "",
        email: formData.contact.email[0] || "",
        website: formData.contact.website,
        departments: formData.departments,
        lab_test_ids: formData.lab_test_ids,
        health_package_ids: formData.health_package_ids,
        operating_hrs: allDaysOperatingHours,
      };

      console.log("Submitting hospital data:", apiData);

      await addOrUpdateHospital(apiData, token);
      toast.success(
        editingHospital
          ? "Hospital updated successfully!"
          : "Hospital added successfully!"
      );

      onAddHospital(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving hospital:", error);
      toast.error(
        editingHospital
          ? "Failed to update hospital. Please try again."
          : "Failed to add hospital. Please try again."
      );
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pinCode: "",
        country: "India",
        landmark: "",
      },
      contact: {
        phone: [],
        email: [],
        website: "",
      },
      description: "",
      departments: [],
      lab_test_ids: [],
      health_package_ids: [],
      operatingHours: {
        Monday: { startTime: "09:00", endTime: "17:00" },
        Tuesday: { startTime: "09:00", endTime: "17:00" },
        Wednesday: { startTime: "09:00", endTime: "17:00" },
        Thursday: { startTime: "09:00", endTime: "17:00" },
        Friday: { startTime: "09:00", endTime: "17:00" },
        Saturday: { startTime: "09:00", endTime: "17:00" },
        Sunday: { startTime: "09:00", endTime: "17:00" },
      },
      emergencyServices: false,
      image: null,
    });
    setContactInputs({ phone: "", email: "", website: "" });
    setSearchTerm("");
    setActiveCategory("Pathology Tests");
    setActiveTab(0);

    setAllPathologyTests([]);
    setAllRadiologyTests([]);
    setAllHealthPackages([]);
    setAvailableTests([]);
    setAvailablePackages([]);
  };

  const renderDepartmentsAndTestsSection = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-[12px] font-semibold text-[#161d1f]">
          <span className="text-red-500">*</span> Available Departments
        </h3>

        {enumLoading ? (
          <div className="text-center py-4 text-xs text-gray-500">
            Loading departments...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enumDepartments.map((dept) => (
              <label
                key={dept.id}
                className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.departments.includes(dept.id)}
                  onChange={() => handleArrayToggle("departments", dept.id)}
                  className="w-4 h-4 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                />
                <span className="text-[12px] text-gray-700">{dept.value}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-[12px] font-semibold text-[#161d1f]">
          Assign Lab Tests & Health Packages
        </h3>

        <div className="flex border-b border-gray-200">
          {["Pathology Tests", "Radiology Tests", "Health Packages"].map(
            (category) => (
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
            )
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeCategory === "Health Packages"
                ? "Search Health Packages..."
                : "Search Lab Tests, Diagnostics..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-600 text-black"
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {loadingTests || loadingPackages ? (
              <div className="p-4 text-center text-xs text-gray-500">
                Loading {activeCategory.toLowerCase()}...
              </div>
            ) : activeCategory === "Health Packages" ? (
              availablePackages.length > 0 ? (
                availablePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-[#161D1F]">
                          {pkg.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Price: ₹{pkg.selling_price} | Tests:{" "}
                          {pkg.linked_test_ids?.length || 0}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {pkg.description}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddPackage(pkg)}
                        disabled={isPackageSelected(pkg.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                          isPackageSelected(pkg.id)
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-[#0088B1] hover:bg-blue-50"
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
                  No packages found
                </div>
              )
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
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#0088B1] hover:bg-blue-50"
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
      </div>

      {(selectedTests.length > 0 || selectedPackages.length > 0) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-[#161D1F] mb-3">
            Selected Items ({selectedTests.length + selectedPackages.length})
          </h4>

          {selectedTests.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-[#161D1F] mb-2">
                Tests ({selectedTests.length})
              </h5>
              <div className="space-y-2">
                {selectedTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-[#161D1F]">
                        {test.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Code: {test.code} | Price: ₹{test.selling_price} |
                        Report Time: {test.report_time_hrs} hrs
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
                      onClick={() => handleRemoveTest(test.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPackages.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-[#161D1F] mb-2">
                Health Packages ({selectedPackages.length})
              </h5>
              <div className="space-y-2">
                {selectedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-[#161D1F]">
                        {pkg.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Price: ₹{pkg.selling_price} | Included Tests:{" "}
                        {pkg.linked_test_ids?.length || 0}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {pkg.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(pkg.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Total: {selectedTests.length} tests + {selectedPackages.length}{" "}
              packages
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h2 className="text-[16px] font-medium text-[#161d1f]">
            {editingHospital ? "Edit Hospital" : "Add New Hospital"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex mx-2">
          {[
            "Basic Information",
            "Hospital Details",
            "Assign Departments & Tests",
            "Operating Hours",
          ].map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-3 px-3 ${
                activeTab === index
                  ? "bg-[#0088B1] text-white rounded-lg text-[10px]"
                  : "bg-gray-100 text-[#161D1F] text-[10px]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 0 && (
            <div className="space-y-8">
              <div className="flex flex-col items-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 h-auto w-full text-center hover:border-[#1BA3C7] transition-colors">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("image", e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="hospitalImage"
                    accept=".jpg,.jpeg,.png"
                  />
                  <label htmlFor="hospitalImage" className="cursor-pointer">
                    <div className="flex items-center justify-center mx-auto mb-4">
                      <ImagePlus
                        className="w-16 h-16 text-[#161D1F]"
                        strokeWidth={1}
                      />
                    </div>
                    <h3 className="text-[12px] font-medium text-[#161d1f] mb-2">
                      Upload Hospital Image
                    </h3>
                    <p className="text-gray-500 mb-2 text-[10px]">
                      {formData.image
                        ? typeof formData.image === "object" &&
                          "name" in formData.image
                          ? formData.image.name
                          : formData.image
                        : "Drag and drop your image here or click to browse"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      (supported file format .jpg, .jpeg, .png)
                    </p>
                  </label>
                  {!formData.image && (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("hospitalImage")?.click()
                      }
                      className="mt-4 text-[10px] px-6 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
                    >
                      Select File
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-medium text-[#161d1f]">
                  Hospital Address
                </h3>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Hospital Name
                  </label>
                  <input
                    type="text"
                    value={formData.name ?? ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="Flat/House No., Building Name, Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      <span className="text-red-500">*</span> Address Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.address.line1 ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "line1")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="Plot No. / Building Name / Street"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address.line2 ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "line2")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="Area, Colony, Sector"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      <span className="text-red-500">*</span> City/Town/Village
                    </label>
                    <input
                      type="text"
                      value={formData.address.city ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "city")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="e.g., Patna"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={formData.address.landmark ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "landmark")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="Near Railway Station, Temple, etc.,"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      <span className="text-red-500">*</span> State
                    </label>
                    <select
                      value={formData.address.state ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "state")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    >
                      <option value="">Select State</option>
                      {enumStates.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      <span className="text-red-500">*</span> PIN Code
                    </label>
                    <input
                      type="text"
                      value={formData.address.pinCode ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "pinCode")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="6-digit PIN Code"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                      <span className="text-red-500">*</span> Country
                    </label>
                    <input
                      type="text"
                      value={formData.address.country ?? ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value, "country")
                      }
                      className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  <span className="text-red-500">*</span> Brief Description
                </label>
                <textarea
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                  placeholder="Brief description of the hospital & its services"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.emergencyServices}
                    onChange={(e) =>
                      handleInputChange("emergencyServices", e.target.checked)
                    }
                    className="w-3 h-3 text-[#1BA3C7] border-gray-300 rounded focus:ring-[#1BA3C7]"
                  />
                  <div>
                    <span className="text-[12px] font-medium text-gray-700">
                      24/7 Emergency Services
                    </span>
                    <p className="text-[10px] text-gray-500">
                      Make the hospital available for 24/7 emergency
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Contact Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={contactInputs.phone ?? ""}
                      onChange={(e) =>
                        handleContactInputChange("phone", e.target.value)
                      }
                      className="flex-1 text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="Enter 10-digit phone / landline no."
                    />
                    <button
                      type="button"
                      onClick={() => addContactInfo("phone")}
                      className="text-[10px] px-4 py-2 text-[#1BA3C7] border border-[#1BA3C7] rounded-lg hover:bg-[#1BA3C7] hover:text-white transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.contact.phone.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.contact.phone.map((phone, index) => (
                        <div
                          key={index}
                          className="text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded"
                        >
                          {phone}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                    <span className="text-red-500">*</span> Email Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={contactInputs.email ?? ""}
                      onChange={(e) =>
                        handleContactInputChange("email", e.target.value)
                      }
                      className="flex-1 text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                      placeholder="e.g., info@hospital.com"
                    />
                    <button
                      type="button"
                      onClick={() => addContactInfo("email")}
                      className="text-[10px] px-4 py-2 text-[#1BA3C7] border border-[#1BA3C7] rounded-lg hover:bg-[#1BA3C7] hover:text-white transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.contact.email.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.contact.email.map((email, index) => (
                        <div
                          key={index}
                          className="text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded"
                        >
                          {email}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#161D1F] mb-2">
                  Website URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={contactInputs.website ?? ""}
                    onChange={(e) =>
                      handleContactInputChange("website", e.target.value)
                    }
                    className="flex-1 text-[10px] px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-[#161D1F] placeholder-gray-400"
                    placeholder="e.g., www.hospital.com"
                  />
                  <button
                    type="button"
                    onClick={() => addContactInfo("website")}
                    className="text-[10px] px-4 py-2 text-[#1BA3C7] border border-[#1BA3C7] rounded-lg hover:bg-[#1BA3C7] hover:text-white transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.contact.website && (
                  <div className="mt-2">
                    <div className="text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {formData.contact.website ?? ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 2 && renderDepartmentsAndTestsSection()}

          {activeTab === 3 && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-semibold text-[#161d1f] mb-6">
                <span className="text-red-500">*</span> Set Operating Hours
              </h3>
              <div className="space-y-6 border border-gray-200 rounded-lg p-4">
                {enumDays.map((dayEnum) => (
                  <div
                    key={dayEnum.id}
                    className="flex items-center justify-start gap-80"
                  >
                    <div className="w-24">
                      <span className="text-[12px] font-medium text-[#161D1F]">
                        {dayEnum.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="time"
                        value={
                          formData.operatingHours[dayEnum.value]?.startTime ||
                          "09:00"
                        }
                        onChange={(e) =>
                          handleOperatingHoursChange(
                            dayEnum.value,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="text-[10px] px-3 py-2 border-b border-gray-300  focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none text-[#161D1F]"
                      />
                      <span className="text-[10px] text-gray-500">to</span>
                      <input
                        type="time"
                        value={
                          formData.operatingHours[dayEnum.value]?.endTime ||
                          "17:00"
                        }
                        onChange={(e) =>
                          handleOperatingHoursChange(
                            dayEnum.value,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="text-[10px] px-3 py-2 border-b border-gray-300 focus:border-[#1BA3C7] focus:ring-1 focus:ring-[#1BA3C7] outline-none text-[#161D1F]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200 gap-4">
          <button
            onClick={resetForm}
            className="px-6 py-2 text-[#161D1F] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          {activeTab > 0 && (
            <button
              onClick={() => setActiveTab(activeTab - 1)}
              className="px-6 py-2 text-[#16181b] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          {activeTab < 3 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="px-6 py-2 text-[#16181b] text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-white text-[10px] bg-[#1BA3C7] border border-gray-300 rounded-lg hover:bg-[#1591B8] transition-colors"
            >
              {editingHospital ? "Update Hospital" : "Add Hospital"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddHospitalModal;
