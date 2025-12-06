"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  FileText,
  Projector,
  ListOrdered,
  ShoppingBag,
} from "lucide-react";

import { PrescriptionCard } from "./components/PrescriptionCard";
import {
  dummyPrescriptions,
  statusOptions,
  sourceOptions,
  verificationOptions,
  sortOptions,
} from "./data/prescriptionData";
import toast from "react-hot-toast";
import AddPrescriptionModal from "./components/AddPrescriptionModal";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PrescriptionData } from "./types/prescription";

const PrescriptionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [selectedVerification, setSelectedVerification] =
    useState("All Verification");
  const [sortBy, setSortBy] = useState("Update (latest)");
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [verificationDropdownOpen, setVerificationDropdownOpen] =
    useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const verificationDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const tabs = [
    "All Prescription",
    "Pending",
    "Processing",
    "Shipped",
    "Cancelled",
  ];
  const [activeTab, setActiveTab] = useState("All Prescription");

  const filteredPrescriptions = dummyPrescriptions
    .filter((prescription) => {
      // Tab filter
      let tabMatch = true;
      switch (activeTab) {
        case "Pending":
          tabMatch = prescription.status === "Pending";
          break;
        case "Processing":
          tabMatch = prescription.status === "Active";
          break;
        case "Shipped":
          tabMatch = prescription.status === "Complete";
          break;
        case "Cancelled":
          tabMatch = prescription.status === "Cancelled";
          break;
        default:
          tabMatch = true;
      }
      const matchesSearch =
        searchTerm === "" ||
        prescription.patientName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        prescription.prescriptionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Status" ||
        prescription.status === selectedStatus;

      const matchesSource =
        selectedSource === "All Sources" ||
        prescription.source === selectedSource;

      const matchesVerification =
        selectedVerification === "All Verification" ||
        prescription.verificationStatus ===
          selectedVerification.replace("All ", "");

      return (
        tabMatch &&
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesVerification
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Update (latest)":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "Update (old)":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "By Status":
          return a.status.localeCompare(b.status);
        case "By Verification Status":
          return (a.verificationStatus || "").localeCompare(
            b.verificationStatus || ""
          );
        default:
          return 0;
      }
    });

  // Handle export to PDF
  const handleExportPDF = () => {
    const prescriptionsToExport =
      selectedPrescriptions.length > 0
        ? dummyPrescriptions.filter((p) => selectedPrescriptions.includes(p.id))
        : filteredPrescriptions;

    if (prescriptionsToExport.length === 0) {
      toast.error("No prescriptions to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Prescription Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = prescriptionsToExport.map((prescription) => [
      prescription.patientName,
      prescription.prescriptionId,
      prescription.status,
      prescription.verificationStatus,
      prescription.source,
      new Date(prescription.date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [
        [
          "Patient Name",
          "Prescription ID",
          "Status",
          "Verification",
          "Source",
          "Date",
        ],
      ],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [0, 112, 154],
        textColor: 255,
        fontSize: 9,
      },
    });

    doc.save(`prescriptions_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(
      `Exported ${prescriptionsToExport.length} prescriptions to PDF`
    );
  };

  // Calculate stats for cards
  const statsData = {
    totalPrescriptions: dummyPrescriptions.length,
    verified: dummyPrescriptions.filter(
      (p) => p.verificationStatus === "Verified"
    ).length,
    pending: dummyPrescriptions.filter((p) => p.status === "Pending").length,
    rejected: dummyPrescriptions.filter(
      (p) => p.verificationStatus === "Rejected"
    ).length,
    awaitingConfirmation: dummyPrescriptions.filter(
      (p) => p.verificationStatus === "Awaiting Confirmation"
    ).length,
    needsVerification: dummyPrescriptions.filter(
      (p) => p.verificationStatus === "Need Verification"
    ).length,
    refillable: dummyPrescriptions.filter((p) => p.refillable).length,
    digitalSources: dummyPrescriptions.filter((p) =>
      ["Mobile App", "Website", "Whatsapp"].includes(p.source)
    ).length,
  };

  // 2. Handler for prescription creation
  const handleSubmitPrescription = (data: PrescriptionData) => {
    // Handle the submitted prescription data
    console.log("New prescription:", data);
    // You would typically send this to your API here
  };

  // Add this useEffect for dropdown handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node) &&
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node) &&
        verificationDropdownRef.current &&
        !verificationDropdownRef.current.contains(event.target as Node) &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node) &&
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
        setSourceDropdownOpen(false);
        setVerificationDropdownOpen(false);
        setSortDropdownOpen(false);
        setActionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownType: string) => {
    setStatusDropdownOpen(
      dropdownType === "status" ? !statusDropdownOpen : false
    );
    setSourceDropdownOpen(
      dropdownType === "source" ? !sourceDropdownOpen : false
    );
    setVerificationDropdownOpen(
      dropdownType === "verification" ? !verificationDropdownOpen : false
    );
    setSortDropdownOpen(dropdownType === "sort" ? !sortDropdownOpen : false);
    setActionDropdownOpen(
      dropdownType === "action" ? !actionDropdownOpen : false
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Prescription Management
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              New Prescription
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          {/* <StatsCard
            title="Total Prescription"
            stats={[
              { label: "Verified", value: statsData.verified },
              { label: "Pending", value: statsData.pending },
              { label: "Rejected", value: statsData.rejected },
              {
                label: "Awaiting Confirmation",
                value: statsData.awaitingConfirmation,
              },
            ]}
            icon={<FileText className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Needs Verification"
            stats={[
              {
                label: "Need Verification",
                value: statsData.needsVerification,
              },
            ]}
            icon={<Projector className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          /> */}
          {/* <StatsCard
            title="Refillable"
            stats={[{ label: "Refillable", value: statsData.refillable }]}
            icon={<ListOrdered className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Digital Sources"
            stats={[{ label: "Digital", value: statsData.digitalSources }]}
            icon={<ShoppingBag className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          /> */}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by patient name, prescription ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            {/* Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => handleDropdownToggle("status")}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-4 h-4" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["All Status", ...statusOptions].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedStatus(option);
                        setStatusDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Source Dropdown */}
            <div className="relative" ref={sourceDropdownRef}>
              <button
                onClick={() => handleDropdownToggle("source")}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedSource}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sourceDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["All Sources", ...sourceOptions].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedSource(option);
                        setSourceDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Dropdown */}
            <div className="relative" ref={verificationDropdownRef}>
              <button
                onClick={() => handleDropdownToggle("verification")}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedVerification}
                <ChevronDown className="w-4 h-4" />
              </button>
              {verificationDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {[
                    "All Verification",
                    ...verificationOptions.filter((o) => o !== "All Verified"),
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedVerification(option);
                        setVerificationDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => handleDropdownToggle("sort")}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setSortDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={handleExportPDF}
                className="flex items-center text-[12px] gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-between mb-4 bg-[#F8F8F8] rounded-lg">
          <div className="">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#0088B1] text-[#F8F8F8]"
                    : "text-[#161D1F] hover:bg-[#E8F4F7] hover:text-[#0088B1]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div>
            {selectedPrescriptions.length > 0 && (
              <div className="flex items-center justify-between px-6 bg-gray-50">
                <div className="text-[10px] text-gray-600 mr-3">
                  {selectedPrescriptions.length} selected
                </div>
                <div className="relative" ref={actionDropdownRef}>
                  <button
                    onClick={() => handleDropdownToggle("action")}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] text-[#161D1F] bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Actions
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {actionDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          // Add delete logic here
                          setActionDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      >
                        Delete All
                      </button>
                      <button
                        onClick={() => {
                          handleExportPDF();
                          setActionDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100"
                      >
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected prescriptions actions */}
        {selectedPrescriptions.length > 0 && (
          <div className="flex items-center justify-between px-6 bg-gray-50 mb-4 py-2 rounded-lg">
            <div className="text-[10px] text-gray-600">
              {selectedPrescriptions.length} selected
            </div>
            <div className="relative" ref={actionDropdownRef}>
              <button
                onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-[12px] text-[#161D1F] bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Actions
                <ChevronDown className="w-4 h-4" />
              </button>
              {actionDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      // Add delete logic here
                      setActionDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setActionDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-left text-[#161D1F] hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescriptions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedPrescriptions.length > 0 &&
                        selectedPrescriptions.length ===
                          filteredPrescriptions.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPrescriptions(
                            filteredPrescriptions.map((p) => p.id)
                          );
                        } else {
                          setSelectedPrescriptions([]);
                        }
                      }}
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Prescription ID
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Doctor Name
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    isSelected={selectedPrescriptions.includes(prescription.id)}
                    onSelect={(id, selected) => {
                      if (selected) {
                        setSelectedPrescriptions([
                          ...selectedPrescriptions,
                          id,
                        ]);
                      } else {
                        setSelectedPrescriptions(
                          selectedPrescriptions.filter((pId) => pId !== id)
                        );
                      }
                    }}
                    onView={(id) => {
                      // Add view logic here
                      console.log("View prescription:", id);
                    }}
                    onEdit={function (id: string): void {
                      throw new Error("Function not implemented.");
                    }}
                    onPrint={function (id: string): void {
                      throw new Error("Function not implemented.");
                    }}
                    onDelete={function (id: string): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                ))}
                {filteredPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No prescriptions found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm ||
                          selectedStatus !== "All Status" ||
                          selectedSource !== "All Sources" ||
                          selectedVerification !== "All Verification"
                            ? "Try adjusting your search or filter criteria."
                            : "No prescriptions available."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddPrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPrescription}
      />
    </div>
  );
};

export default PrescriptionManagement;
