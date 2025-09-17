"use client";
import React, { useEffect, useState } from "react";
import { ordersData, type Order } from "./data/orders";
import {
  Search,
  ChevronDown,
  Users,
  Eye,
  Edit,
  X,
  Download,
} from "lucide-react";
import ViewOrderModal from "./components/ViewOrderModal";
import UpdatePaymentModal from "./components/UpdatePaymentModal";
import StatsCard from "./components/StatsCard";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-[#34C759] text-white";
      case "scheduled":
        return "bg-[#2F80ED] text-white";
      case "in-progress":
        return "bg-[#FF9500] text-white";
      case "cancelled":
        return "bg-[#FF3B30] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-medium ${getStatusStyles()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "paid":
        return "bg-[#34C759] text-white";
      case "pending":
        return "bg-[#FF9500] text-white";
      case "refunded":
        return "bg-[#2F80ED] text-white";
      case "failed":
        return "bg-[#FF3B30] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-medium ${getStatusStyles()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ConsultationTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-[8px] text-[#0088B1] border border-[#0088B1] hover:bg-[#0088B1] hover:text-white transition-colors`}
    >
      {type === "online" ? "Online" : "In-Person"}
    </span>
  );
};

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedPayment, setSelectedPayment] = useState("All Payments");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [openDropdown, setOpenDropdown] = useState<
    null | "status" | "payment" | "tabs"
  >(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All Bookings");

  const statusOptions = [
    "All Status",
    "Completed",
    "Scheduled",
    "In-Progress",
    "Cancelled",
  ];
  const paymentOptions = [
    "All Payments",
    "Paid",
    "Pending",
    "Refunded",
    "Failed",
  ];
  const tabOptions = ["All Bookings", "Online", "In-Person"];

  // Generate stats
  const generateStats = () => {
    const totalConsultations = orders.length;
    const totalBookingsRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const onlineRevenue = orders
      .filter((order) => order.consultationType === "online")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const inPersonRevenue = orders
      .filter((order) => order.consultationType === "in-person")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const onlinePercentage =
      totalConsultations > 0
        ? Math.round(
            (orders.filter((o) => o.consultationType === "online").length /
              totalConsultations) *
              100
          )
        : 0;
    const inPersonPercentage =
      totalConsultations > 0
        ? Math.round(
            (orders.filter((o) => o.consultationType === "in-person").length /
              totalConsultations) *
              100
          )
        : 0;

    return {
      totalConsultations,
      totalBookingsRevenue,
      onlineRevenue,
      inPersonRevenue,
      onlinePercentage,
      inPersonPercentage,
    };
  };

  const stats = generateStats();

  useEffect(() => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((order) => {
        return (
          order.consultationStatus.toLowerCase() ===
          selectedStatus.toLowerCase()
        );
      });
    }

    // Filter by payment status
    if (selectedPayment !== "All Payments") {
      filtered = filtered.filter((order) => {
        return (
          order.paymentStatus.toLowerCase() === selectedPayment.toLowerCase()
        );
      });
    }

    // Filter by tab
    if (activeTab !== "All Bookings") {
      filtered = filtered.filter((order) => {
        return (
          order.consultationType.toLowerCase() ===
          activeTab.toLowerCase().replace("-", "")
        );
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, selectedStatus, selectedPayment, activeTab, orders]);

  // Load orders data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    }, 500);
  }, []);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handlePaymentChange = (payment: string) => {
    setSelectedPayment(payment);
    setOpenDropdown(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setOpenDropdown(null);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleUpdatePaymentStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowUpdatePaymentModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleCloseUpdatePaymentModal = () => {
    setShowUpdatePaymentModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              consultationStatus: "cancelled" as const,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  useEffect(() => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Consultation Booking Management
          </h1>
          <button className="flex items-center text-[12px] gap-2 text-black border border-[#D3D7D8] px-6 py-2 rounded-lg transition-colors hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Consultations"
            stats={stats.totalConsultations}
            subtitle="292 Completed • 48 Scheduled • 26 Cancelled"
            icon={<Users className="w-6 h-6" />}
            color="text-cyan-500"
          />
          <StatsCard
            title="Total Bookings Revenue"
            stats={`₹ ${stats.totalBookingsRevenue.toLocaleString()}.00`}
            subtitle=""
            icon={<Users className="w-6 h-6" />}
            color="text-cyan-500"
          />
          <StatsCard
            title="Total In-Person Revenue"
            stats={`₹ ${stats.inPersonRevenue.toLocaleString()}.00`}
            subtitle={`${stats.inPersonPercentage}% of total consultations`}
            icon={<Users className="w-6 h-6" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Total Online Revenue"
            stats={`₹ ${stats.onlineRevenue.toLocaleString()}.00`}
            subtitle={`${stats.onlinePercentage}% of total consultations`}
            icon={<Users className="w-6 h-6" />}
            color="text-green-500"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by booking ID, patient, doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedStatus}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === "status" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedStatus === status
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "payment" ? null : "payment")
                }
                className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50"
              >
                {selectedPayment}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === "payment" && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {paymentOptions.map((payment) => (
                    <button
                      key={payment}
                      onClick={() => handlePaymentChange(payment)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedPayment === payment
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#161D1F]"
                      }`}
                    >
                      {payment}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
                Pick a date range
              </button>
            </div>
            <div className="relative">
              <button className="dropdown-toggle flex items-center text-[12px] gap-2 px-4 py-3 border border-gray-300 rounded-lg text-[#161D1F] hover:bg-gray-50">
                Sort
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-[12px] font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-[#0088B1] text-white"
                  : "bg-white text-[#161D1F] border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {filteredOrders.length} Bookings
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
                        selectedOrders.length === filteredOrders.length &&
                        filteredOrders.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Doctor Details
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Consultation Date
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Consultation Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Loading orders...</div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No orders found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) =>
                            handleSelectOrder(order.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-[#161D1F] mb-1">
                            {order.patientName}
                          </div>
                          <div className="text-[10px] text-gray-500 mb-2">
                            Booking ID: {order.bookingId}
                          </div>
                          <div className="text-[10px] text-gray-500 mb-2">
                            {order.patientContact}
                          </div>
                          <div className="flex items-center gap-4 text-[10px]">
                            <ConsultationTypeBadge
                              type={order.consultationType}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Users className="w-3 h-3" />
                            {order.doctorName}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {order.doctorSpecialization}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-medium text-[#161D1F]">
                          {order.consultationDate}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Booked: {order.bookedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.consultationStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <PaymentBadge status={order.paymentStatus} />
                          <div className="text-[10px] text-gray-500">
                            Method: {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-medium text-[#161D1F]">
                          ₹ {order.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Incl. GST: ₹ {order.gst.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-500"
                            onClick={() => handleViewOrder(order)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-500"
                            onClick={() => handleUpdatePaymentStatus(order)}
                            title="Update Payment Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-400 hover:text-red-500"
                            onClick={() => handleCancelOrder(order.id)}
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
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

      <ViewOrderModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        order={selectedOrder}
      />

      <UpdatePaymentModal
        isOpen={showUpdatePaymentModal}
        onClose={handleCloseUpdatePaymentModal}
        order={selectedOrder}
        onUpdate={handleUpdateOrder}
      />
    </div>
  );
};

export default Orders;
