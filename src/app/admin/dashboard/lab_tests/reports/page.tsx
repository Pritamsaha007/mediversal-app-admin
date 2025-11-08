"use client";
import React, { useState } from "react";
import { Search, ChevronDown, Eye, Printer } from "lucide-react";
import toast from "react-hot-toast";

interface Report {
  id: string;
  patientName: string;
  bookingId: string;
  testsBooked?: string;
  testCategory?: string;
  packageBooked?: string;
  reportStatus: string;
  isHospitalVisit?: boolean;
  reportDateTime: string;
  processedBy: string;
  collectionType: string;
}

const ReportsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Status");
  const [selectedDateRange, setSelectedDateRange] =
    useState("Pick a date range");
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      patientName: "Anupam Prakash",
      bookingId: "CBC0003456",
      testsBooked: "MRI Scan",
      testCategory: "Pathology",
      isHospitalVisit: true,
      reportStatus: "Sent",
      reportDateTime: "15/09/2025 11:30 AM",
      processedBy: "Dr. RavishKuuthai",
      collectionType: "LubvNepark visit",
    },
  ]);
  const [filteredReports, setFilteredReports] = useState<Report[]>(reports);
  const [openDropdown, setOpenDropdown] = useState<null | "filter" | "date">(
    null
  );
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filterOptions = [
    "All Status",
    "Start",
    "Pooling",
    "Under Review",
    "Processing",
  ];
  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
    "Custom range",
  ];

  // Filter reports based on search and filters
  React.useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== "All Status") {
      filtered = filtered.filter(
        (report) => report.reportStatus === selectedFilter
      );
    }

    setFilteredReports(filtered);
  }, [searchTerm, selectedFilter, reports]);

  const handleSelectReport = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, id]);
    } else {
      setSelectedReports(selectedReports.filter((reportId) => reportId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map((report) => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, reportStatus: newStatus }
            : report
        )
      );

      toast.success(`Report status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update report status");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = (reportId: string) => {
    toast.success("Report sent successfully");
  };

  const handlePrintReport = (reportId: string) => {
    toast.success("Printing report...");
  };

  const renderTests = (report: Report) => {
    return (
      <div className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-700">{report.testsBooked}</span>
          <div className="flex-row gap-5">
            {report.testCategory == "Pathology" ? (
              <span className="text-xs text-[#594D44] bg-[#F6D1E9] rounded-md px-1 py-1 flex-1 mr-2">
                {report.testCategory}
              </span>
            ) : (
              <span className="text-xs text-[#594D44] bg-[#ECD8C9] rounded-md px-1 py-1 flex-1 mr-2">
                {report.testCategory}
              </span>
            )}
            {report.isHospitalVisit && (
              <span className="text-xs text-[#9B51E0] rounded-md border-1 border-[#9B51E0] px-1 py-1 flex-1">
                Lab/Hospital visit
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent":
        return "bg-[#34C759] text-white";
      case "Pending":
        return "bg-[#34C759] text-white";
      case "Under Review":
        return "border-1 border-[#34C759] text-[#34C759]";
      case "Processing":
        return "bg-[#2F80ED] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Reports Management
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by patient name, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "filter" ? null : "filter")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedFilter}
                <ChevronDown className="w-5 h-5" />
              </button>
              {openDropdown === "filter" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setSelectedFilter(filter);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedFilter === filter
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "date" ? null : "date")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedDateRange}
                <ChevronDown className="w-5 h-5" />
              </button>
              {openDropdown === "date" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {dateRangeOptions.map((dateRange) => (
                    <button
                      key={dateRange}
                      onClick={() => {
                        setSelectedDateRange(dateRange);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedDateRange === dateRange
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {dateRange}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Reports
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredReports.length} Reports
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedReports.length === filteredReports.length &&
                        filteredReports.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Tests Booked
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Report Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Report Date & Time
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No reports found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedReports.includes(report.id)}
                          onChange={(e) =>
                            handleSelectReport(report.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-[#161D1F]">
                            {report.patientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking ID: {report.bookingId}
                          </div>
                          <div className="text-xs text-gray-400">
                            Processed by: {report.processedBy}
                          </div>
                          {/* <div className="text-xs text-gray-400">
                            ({report.collectionType})
                          </div> */}
                        </div>
                      </td>
                      <td className="px-6 py-4">{renderTests(report)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                            report.reportStatus
                          )}`}
                        >
                          {report.reportStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs ">
                        <span className="text-xs text-[#0073A0] bg-[#E8F4F7] rounded-md px-1 py-1 flex-1 mr-2">
                          {report.reportDateTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="p-1 text-gray-500 hover:text-blue-500"
                            disabled={loading}
                            title="Delete Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrintReport(report.id)}
                            className="p-1 text-gray-500 hover:text-purple-500"
                            title="Print Report"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
