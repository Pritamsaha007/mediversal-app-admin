"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  LabTestReport,
  ReportStatus,
  SearchLabTestReportsPayload,
} from "./types";
import { searchLabTestReports } from "../services";
import { useAdminStore } from "@/app/store/adminStore";

const getDateRangeForFilter = (
  filter: string
): { start_date: string | null; end_date: string | null } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  let startDate = null;

  switch (filter) {
    case "Today":
      startDate = new Date(today);
      break;
    case "Yesterday":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Last 7 days":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      break;
    case "Last 30 days":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      break;
    case "This month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);

      endDate.setFullYear(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Last month":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      endDate.setFullYear(today.getFullYear(), today.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      return { start_date: null, end_date: null };
  }

  const formatToISO = (d: Date) => d.toISOString();

  return {
    start_date: formatToISO(startDate),
    end_date: formatToISO(endDate),
  };
};

// Debounce hook/utility
const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
};

const ReportsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    ReportStatus | "All Status"
  >("All Status");
  const [selectedDateRange, setSelectedDateRange] = useState("All Time");

  const [reports, setReports] = useState<LabTestReport[]>([]);

  const [openDropdown, setOpenDropdown] = useState<null | "filter" | "date">(
    null
  );
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const filterOptions: (ReportStatus | "All Status")[] = [
    "All Status",
    "Pending",
    "No report",
    "Sent",
    "Under Review",
  ];

  const dateRangeOptions = [
    "All Time",
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
  ];
  const { token } = useAdminStore();

  const fetchReports = async () => {
    setLoading(true);

    const dateRange = getDateRangeForFilter(selectedDateRange);
    let finalStartDate = dateRange.start_date;
    let finalEndDate = dateRange.end_date;

    if (selectedDateRange === "All Time") {
      finalStartDate = null;
      finalEndDate = null;
    }

    try {
      const payload: SearchLabTestReportsPayload = {
        search_text: currentSearchTerm || null,
        filter_report_status:
          selectedFilter !== "All Status" ? [selectedFilter] : null,
        sort_by: "booking_date",
        sort_order: "DESC",

        start: 0,
        max: null,
        start_date: finalStartDate,
        end_date: finalEndDate,
      };

      const data = await searchLabTestReports(payload, token);

      if (data.success) {
        let tempR: LabTestReport[] = [];

        data.reports.map((report) => {
          if (report.report_url) {
            tempR.push(report);
          }
        });
        setReports(tempR);

        //toast.success(`Loaded ${tempR.length} reports`);
      } else {
        throw new Error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };
  console.log(reports, "reports");

  const updateSearchTerm = useCallback(() => {
    setCurrentSearchTerm(searchTerm);
  }, [searchTerm]);

  const debouncedUpdateSearchTerm = useDebounce(updateSearchTerm, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedUpdateSearchTerm();
  };

  const applyFiltersAndSearch = () => {
    fetchReports();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (
        debouncedUpdateSearchTerm &&
        (debouncedUpdateSearchTerm as any).cancel
      ) {
        (debouncedUpdateSearchTerm as any).cancel();
      }
      setCurrentSearchTerm(searchTerm);
    }
  };

  useEffect(() => {
    applyFiltersAndSearch();
  }, [selectedFilter, selectedDateRange, currentSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-toggle") &&
        !target.closest(".dropdown-menu")
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectReport = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, id]);
    } else {
      setSelectedReports(selectedReports.filter((reportId) => reportId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(reports.map((report) => report.booking_id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleViewReport = (reportUrl: string) => {
    setPreviewUrl(reportUrl);
    setShowPreview(true);
    setZoomLevel(1);
    setRotation(0);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setZoomLevel(1);
    setRotation(0);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const isPdf = (url: string) => {
    return url.toLowerCase().endsWith(".pdf");
  };

  const isImage = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const renderTests = (report: LabTestReport) => {
    const validTests = report.test_names.filter(
      (test) => test && test.trim() !== ""
    );
    const validCategories = report.category_names.filter(
      (cat) => cat && cat.trim() !== ""
    );

    return (
      <div className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          {validTests.length > 0 ? (
            validTests.map((test, index) => (
              <span key={index} className="text-xs text-gray-700">
                {test}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No tests specified</span>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {validCategories.map((category, index) => (
              <span
                key={index}
                className={`text-xs text-[#594D44] rounded-md px-2 py-1 ${
                  category === "Pathology" ? "bg-[#F6D1E9]" : "bg-[#ECD8C9]"
                }`}
              >
                {category}
              </span>
            ))}
            {report.is_hospital_visit ? (
              <span className="text-xs text-[#9B51E0] rounded-md border border-[#9B51E0] px-2 py-1">
                Lab/Hospital visit
              </span>
            ) : (
              <span className="text-xs text-[#9B51E0] rounded-md border border-[#9B51E0] px-2 py-1">
                Home Collection Visit
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Sent":
        return "bg-[#34C759] text-white";
      case "Pending":
        return "bg-[#FF9500] text-white";
      case "Under Review":
        return "border border-[#34C759] text-[#34C759] bg-white";
      case "No report":
        return "bg-[#FF3B30] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Report Preview</h3>
              <div className="flex items-center gap-4">
                {/* Image Controls */}
                {isImage(previewUrl) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={zoomOut}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={rotate}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Rotate"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetView}
                      className="p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Reset View"
                    >
                      Reset
                    </button>
                  </div>
                )}
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {isPdf(previewUrl) ? (
                <div className="w-full h-full">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[500px] border-0"
                    title="Report PDF"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              ) : isImage(previewUrl) ? (
                <div className="overflow-auto max-w-full max-h-full">
                  <img
                    src={previewUrl}
                    alt="Report"
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">Unsupported file format</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    download
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
            <div className="border-t p-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {isPdf(previewUrl)
                    ? "PDF Document"
                    : isImage(previewUrl)
                    ? "Image"
                    : "File"}
                </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  download
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search by patient name, booking ID, test names..."
              value={searchTerm}
              onChange={handleSearchChange} // Use the new debounced change handler
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 text-[#161D1F] pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
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
                <div className="dropdown-menu absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                <div className="dropdown-menu absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
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
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-medium text-[#161D1F]">
                All Reports
                <span className="text-[8px] text-[#899193] font-normal ml-2">
                  {reports.length} Reports
                </span>
              </h3>
            </div>
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
                        selectedReports.length === reports.length &&
                        reports.length > 0
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
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No reports found for the current filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.booking_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedReports.includes(report.booking_id)}
                          onChange={(e) =>
                            handleSelectReport(
                              report.booking_id,
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-[#161D1F]">
                            {report.patient_name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking ID:{" "}
                            {report.booking_id.slice(0, 6).toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{renderTests(report)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                            report.report_status
                          )}`}
                        >
                          {report.report_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="text-xs text-[#0073A0] bg-[#E8F4F7] rounded-md px-2 py-1">
                          {formatDateTime(report.report_date_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#161D1F]">
                        <div className="flex items-center gap-2 justify-end">
                          {report.report_url ? (
                            <>
                              {/* <button
                                onClick={() =>
                                  handleViewReport(report.report_url!)
                                }
                                className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                                title="View Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button> */}

                              <a
                                href={report.report_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-500 hover:text-[#0088B1] transition-colors"
                                title="Download/Open Report"
                                download
                              >
                                {/* <Download className="w-4 h-4" /> */}
                                Download Report
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No report available
                            </span>
                          )}
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
