"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
} from "lucide-react";
import { Notification, SearchNotificationParams } from "./types/types";
import { searchNotifications } from "./services/service";
import CreateNotificationModal from "./components/CreateNotificationModal";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getUserGroupColor,
  formatUserGroup,
  formatScheduledDays,
} from "./utils/utils";
import Pagination from "@/app/components/common/pagination";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import NotificationDetailsModal from "./components/NotificationDetailsModal";
import DropdownSelector from "@/app/components/ui/DropdownSelector";

const ITEMS_PER_PAGE = 20;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Notifications");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const { token } = useAdminStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [viewingNotification, setViewingNotification] =
    useState<Notification | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  const filterOptions = [
    "All Notifications",
    "Live",
    "Scheduled",
    "Completed",
    "Inactive",
  ];

  const loadNotifications = async (page: number, search: string = "") => {
    if (!token) return;

    setLoading(true);
    try {
      const params: SearchNotificationParams = {
        search_text: search || null,
        p_notification_queue_id: null,
        p_customer_id: null,
        p_status:
          selectedFilter !== "All Notifications"
            ? selectedFilter.toUpperCase()
            : null,
        limit_count: ITEMS_PER_PAGE,
        offset_count: page * ITEMS_PER_PAGE,
      };

      const response = await searchNotifications(params, token);

      if (response.success) {
        setNotifications(response.data);
        setHasMore(response.data.length === ITEMS_PER_PAGE);
        setTotalItems(response.data.length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(currentPage, searchTerm);
  }, [token, currentPage, selectedFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedNotifications([]);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0);
      loadNotifications(0, value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleDeleteNotification = async (notification: Notification) => {
    if (!token) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${notification.message_title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      toast.success("Notification deleted successfully!");
      loadNotifications(currentPage, searchTerm);
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedNotifications([]);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
      setSelectedNotifications([]);
    }
  };

  const renderScheduledDays = (notification: Notification) => {
    const scheduledDays = formatScheduledDays(notification);

    if (scheduledDays.length === 0) {
      return (
        <span className="text-[10px] bg-[#E8F4F7] text-[#161d1f] px-2 py-1 rounded">
          Once: {formatTime(notification.notification_time)}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {scheduledDays.map((schedule, index) => (
          <span
            key={index}
            className="text-[10px] bg-[#E8F4F7] text-[#161d1f] px-2 py-1 rounded"
          >
            {schedule.day}: {schedule.time}
          </span>
        ))}
      </div>
    );
  };

  const exportNotificationsToCSV = (notifications: Notification[]) => {
    const headers = [
      "Notification ID",
      "Message Title",
      "Targeted User Group",
      "Start Date",
      "End Date",
      "Notification Time",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...notifications.map((n) =>
        [
          `"${n.id}"`,
          `"${n.message_title}"`,
          `"${formatUserGroup(n.targeted_user_group_value)}"`,
          `"${n.start_date ? formatDate(n.start_date) : "N/A"}"`,
          `"${n.end_date ? formatDate(n.end_date) : "N/A"}"`,
          `"${n.notification_time || "N/A"}"`,
          n.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `notifications_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectNotification = (
    notificationId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(
        selectedNotifications.filter((id) => id !== notificationId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(
        notifications.map((notification) => notification.id)
      );
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleExport = () => {
    if (notifications.length === 0) {
      toast.error("No notifications to export");
      return;
    }

    const notificationsToExport =
      selectedNotifications.length > 0
        ? notifications.filter((n) => selectedNotifications.includes(n.id))
        : notifications;

    exportNotificationsToCSV(notificationsToExport);
    toast.success(
      `Exported ${notificationsToExport.length} notifications successfully!`
    );
    setSelectedNotifications([]);
  };

  useEffect(() => {
    setSelectedNotifications([]);
    loadNotifications(currentPage, searchTerm);
  }, [token, currentPage, selectedFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[16px] font-medium text-[#161D1F]">
            Push Notification Manager
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center text-[12px] gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Push Notification
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, or notification ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:outline-none  text-[12px] "
            />
          </div>

          {/* Export button */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading || notifications.length === 0}
              className={`flex items-center gap-2 px-4 py-3 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 ${
                loading || notifications.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {selectedNotifications.length > 0
                ? `Export Selected (${selectedNotifications.length})`
                : "Export All"}
            </button>
          </div>

          {/* Filter dropdown - keep existing */}
          <div className="relative">
            <DropdownSelector
              label=""
              options={filterOptions}
              selected={selectedFilter}
              placeholder="Select Filter"
              open={filterDropdownOpen}
              toggleOpen={() => setFilterDropdownOpen(!filterDropdownOpen)}
              onSelect={(value) => {
                setSelectedFilter(value);
                setCurrentPage(0);
                setSelectedNotifications([]); // Clear selection
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {selectedFilter}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {notifications.length} Notifications
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                      checked={
                        selectedNotifications.length === notifications.length &&
                        notifications.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      disabled={loading || notifications.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Notification ID
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Time Range
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Scheduled Days
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No notifications found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedNotifications.includes(
                            notification.id
                          )}
                          onChange={(e) =>
                            handleSelectNotification(
                              notification.id,
                              e.target.checked
                            )
                          }
                          disabled={loading}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-[12px] font-medium text-[#161D1F]">
                            {notification.id.substring(0, 8).toUpperCase()}
                          </div>
                          <span
                            className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[8px] font-medium border ${getUserGroupColor(
                              notification.targeted_user_group_value
                            )}`}
                          >
                            {formatUserGroup(
                              notification.targeted_user_group_value
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-medium text-[#161D1F]">
                          {notification.message_title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {notification.start_date && (
                            <div className="text-[10px] text-green-600">
                              <span className="font-medium">Start: </span>
                              {formatDate(notification.start_date)}
                            </div>
                          )}
                          {notification.end_date && (
                            <div className="text-[10px] text-red-600">
                              <span className="font-medium">End: </span>
                              {formatDate(notification.end_date)}
                            </div>
                          )}
                          {!notification.end_date &&
                            notification.start_date && (
                              <div className="text-[10px] text-gray-600">
                                <span className="font-medium">Once: </span>
                                {formatDate(notification.start_date)}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="border border-[#E5E8E9] rounded-lg p-2 max-w-xs">
                          {renderScheduledDays(notification)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium ${getStatusColor(
                            notification.status
                          )}`}
                        >
                          {notification.status.charAt(0) +
                            notification.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                            title="View Notification"
                            onClick={() => {
                              setViewingNotification(notification);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-[#0088B1] cursor-pointer"
                            title="Edit Notification"
                            onClick={() => {
                              setEditingNotification(notification);
                              setIsCreateModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* <button
                            className="p-2 text-red-400 hover:text-red-500 cursor-pointer"
                            onClick={() =>
                              handleDeleteNotification(notification)
                            }
                            disabled={loading}
                            title="Delete Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && notifications.length > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={loading}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>
      <NotificationDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingNotification(null);
        }}
        notification={viewingNotification}
      />
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingNotification(null);
        }}
        token={token}
        editNotification={editingNotification}
        onSuccess={() => {
          loadNotifications(currentPage, searchTerm);
        }}
      />
    </div>
  );
};

export default Notifications;
