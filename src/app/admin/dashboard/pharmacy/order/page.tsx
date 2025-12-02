"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  FileText,
  ShoppingCart,
  FileCheck,
  DollarSign,
  Truck,
  Trash2,
  Eye,
  PlusIcon,
  Bike,
} from "lucide-react";
import { Order, FilterOptions, SortOption } from "./types/types";
import { OrderService } from "./services";
import { StatsCard } from "./components/StatsCard";
import StatusBadge from "./components/StatusBadge";
import OrderActionDropdown from "./components/OrderActionDropdown";

import PrescriptionModal from "./components/OrderSummary";
import Pagination from "@/app/components/common/pagination";
import PlaceOrderModal from "./components/PlaceOrderModal/PlaceOrderModal";
import AssignRiderModal from "../../rider/components/AddRiderModal";
import DeliveryOrder from "../../rider/types";
import toast from "react-hot-toast";

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedPayment, setSelectedPayment] = useState("All Payments");
  const [sortBy, setSortBy] = useState<SortOption>("Sort");
  const [activeTab, setActiveTab] = useState("All Orders");
  const [openDropdown, setOpenDropdown] = useState<
    null | "status" | "payment" | "sort"
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderActionDropdown, setOrderActionDropdown] = useState<number | null>(
    null
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allOrdersForStats, setAllOrdersForStats] = useState<Order[]>([]);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedOrderForPrescription, setSelectedOrderForPrescription] =
    useState<Order | null>(null);
  const [isAssignRiderModalOpen, setIsAssignRiderModalOpen] = useState(false);
  const [selectedOrderForRider, setSelectedOrderForRider] =
    useState<Order | null>(null);
  // Calculate if there are more pages available
  const hasMore = (currentPage + 1) * itemsPerPage < allOrdersForStats.length;

  // Debug pagination
  console.log("Pagination Debug:", {
    currentPage,
    itemsPerPage,
    ordersOnPage: orders.length,
    totalCount,
    hasMore,
    calculation: `(${currentPage + 1} * ${itemsPerPage}) = ${
      (currentPage + 1) * itemsPerPage
    } < ${totalCount}`,
  });

  const statusOptions = [
    "All Statuses",
    "Pending",
    "Processing",
    "Packed",
    "Shipped",
    "On Going",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const paymentOptions = [
    "All Payments",
    "Pending",
    "Failed",
    "On Going",
    "Paid",
    "Refund",
    "PAID",
  ];

  const sortOptions: SortOption[] = [
    "Sort",
    "Order Total (Low to High)",
    "Order Total (High to Low)",
    "Order Date (Latest)",
    "Order Date (Oldest)",
    "By Order Status",
    "By Payment Status",
  ];

  // Map sort options to API parameters
  const getSortParams = (sortOption: SortOption) => {
    switch (sortOption) {
      case "Order Total (Low to High)":
        return { sort_by: "totalorderamount", sort_order: "ASC" };
      case "Order Total (High to Low)":
        return { sort_by: "totalorderamount", sort_order: "DESC" };
      case "Order Date (Latest)":
        return { sort_by: "created_date", sort_order: "DESC" };
      case "Order Date (Oldest)":
        return { sort_by: "created_date", sort_order: "ASC" };
      case "By Order Status":
        return { sort_by: "deliverystatus", sort_order: "ASC" };
      case "By Payment Status":
        return { sort_by: "paymentstatus", sort_order: "ASC" };
      default:
        return { sort_by: "created_date", sort_order: "DESC" };
    }
  };

  const fetchOrders = async (resetPage: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const page = resetPage ? 0 : currentPage;
      const sortParams = getSortParams(sortBy);

      const params = {
        search: searchTerm.trim(),
        start: page * itemsPerPage,
        max: itemsPerPage,
        sort_by: sortParams.sort_by,
        sort_order: sortParams.sort_order,
        status: selectedStatus === "All Statuses" ? "" : selectedStatus,
        payment: selectedPayment === "All Payments" ? "" : selectedPayment,
      };

      console.log("Fetching orders with params:", params);
      const { orders: fetchedOrders, totalCount: total } =
        await OrderService.fetchOrders(params);

      console.log(
        "API Response - Orders:",
        fetchedOrders.length,
        "Total Count:",
        total
      );
      setOrders(fetchedOrders);
      setTotalCount(total);

      if (resetPage) {
        setCurrentPage(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders for stats (without pagination)
  const fetchAllOrdersForStats = async () => {
    try {
      const { orders: allOrders } = await OrderService.fetchOrders({
        max: 10000, // Large number to get all orders
        start: 0,
      });
      setAllOrdersForStats(allOrders);
    } catch (err) {
      console.error("Failed to fetch orders for stats:", err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchOrders(true);
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders(true);
  }, [selectedStatus, selectedPayment, sortBy]);

  // Fetch orders when page changes
  useEffect(() => {
    if (currentPage > 0) {
      fetchOrders(false);
    }
  }, [currentPage]);

  // Initial fetch
  useEffect(() => {
    fetchOrders(true);
    fetchAllOrdersForStats();
  }, []);

  const handleExportPDF = () => {
    console.log("Exporting orders to PDF...");
  };

  const handleStatusChange = (status: string) => {
    console.log("Status changed to:", status);
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const handlePaymentChange = (payment: string) => {
    console.log("Payment changed to:", payment);
    setSelectedPayment(payment);
    setOpenDropdown(null);
  };

  const getRiderDeliveryStatus = (
    status: string
  ): "Pending" | "In Progress" | "Completed" | "Cancelled" => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "out for delivery":
      case "on going":
      case "shipped":
        return "In Progress";
      default:
        return "Pending";
    }
  };
  const handleCloseRiderModal = () => {
    setIsAssignRiderModalOpen(false);
    setSelectedOrderForRider(null);
  };

  const handleRiderAssignmentSuccess = () => {
    toast.success("Rider assigned successfully!");
    fetchOrders(true);
  };
  const handleOpenRiderModal = (order: Order) => {
    setSelectedOrderForRider(order);
    setIsAssignRiderModalOpen(true);
  };
  const handleSortChange = (sort: SortOption) => {
    console.log("Sort changed to:", sort);
    setSortBy(sort);
    setOpenDropdown(null);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedOrders.length} selected orders?`
      )
    ) {
      try {
        setLoading(true);
        const orderIds = selectedOrders.map((id) => parseInt(id));
        await OrderService.bulkDeleteOrders(orderIds);
        setSelectedOrders([]);
        await fetchOrders(true);
        await fetchAllOrdersForStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bulk delete failed");
      } finally {
        setLoading(false);
      }
    }
    setActionDropdownOpen(false);
  };

  const handleOrderCreated = () => {
    fetchOrders(true);
    fetchAllOrdersForStats();
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (!orderId) return;

    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageOrders = orders
        .filter((order) => order.id != null)
        .map((order) => order.id.toString());

      setSelectedOrders([
        ...new Set([...selectedOrders, ...currentPageOrders]),
      ]);
    } else {
      const currentPageOrderIds = orders
        .filter((order) => order.id != null)
        .map((order) => order.id.toString());

      setSelectedOrders(
        selectedOrders.filter((id) => !currentPageOrderIds.includes(id))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-toggle")) {
        setOpenDropdown(null);
        setOrderActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0 && !loading) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const stats = OrderService.generateOrderStats(allOrdersForStats);

  console.log("Current orders:", orders, "Total count:", totalCount);
  console.log(orders.map((t) => t.rider_delivery_status));

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">Orders</h1>
          <button
            onClick={() => setIsPlaceOrderModalOpen(true)}
            className="bg-[#0088B1] text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 mt-4 hover:bg-[#006f8e]"
          >
            <PlusIcon className="w-4 h-4" />
            Place New Order
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <StatsCard
            title="Total Orders"
            stats={stats.totalOrders}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="text-blue-500"
          />
          <StatsCard
            title="Prescriptions Verification"
            stats={stats.prescriptionVerification}
            icon={<FileCheck className="w-5 h-5" />}
            color="text-green-500"
          />
          <StatsCard
            title="Revenue"
            stats={OrderService.formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="w-5 h-5" />}
            color="text-emerald-500"
          />
          <StatsCard
            title="Pending Delivery"
            stats={stats.pendingDelivery}
            icon={<Truck className="w-5 h-5" />}
            color="text-orange-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => {
                  setError(null);
                  fetchOrders(true);
                }}
                className="text-red-600 hover:text-red-800 underline text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#161D1F]" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-[#B0B6B8] focus:text-black pr-4 py-3 border border-[#E5E8E9] rounded-xl focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-xs"
            />
          </div>
        </div>

        <div className="flex justify-between mb-4 bg-[#F8F8F8] rounded-lg">
          <div className=""></div>
          <div>
            {selectedOrders.length > 0 && (
              <div className="flex items-center justify-between px-6 bg-gray-50">
                <div className="text-[10px] text-gray-600 mr-3">
                  {selectedOrders.length} selected
                </div>
                <div className="relative" ref={actionDropdownRef}>
                  <button
                    onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-[#161D1F] bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Actions
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {actionDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="block w-full px-4 py-2 text-xs text-left text-[#161D1F] hover:bg-gray-100"
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {activeTab}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                {totalCount} Orders
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
                        orders.length > 0 &&
                        orders.every(
                          (order) =>
                            order.id != null &&
                            selectedOrders.includes(order.id.toString())
                        )
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-medium text-[#161D1F] tracking-wider">
                    Order Status
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id || `order-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
                          checked={selectedOrders.includes(
                            order?.id?.toString() ?? ""
                          )}
                          onChange={(e) => {
                            if (order?.id != null) {
                              handleSelectOrder(
                                order.id.toString(),
                                e.target.checked
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-[#161D1F]">
                          {order.id.slice(0, 6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-[#161D1F]">
                          <div className="font-medium">
                            {order?.customername || "Guest User"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customerphone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#161D1F]">
                        <div className="flex flex-col items-start">
                          {OrderService.formatDate(order.created_date)}

                          <span className="text-[10px] text-[#899193] mt-1">
                            {order.deliverystatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#161D1F]">
                        {OrderService.formatCurrency(
                          OrderService.calculateTotalAmount(order)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <StatusBadge status={order.paymentstatus} />
                          <span className="text-[10px] text-[#899193] mt-1">
                            Method: {order.paymentmethod}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={OrderService.getOrderStatus(order)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#161D1F] flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrderForPrescription(order);
                              setPrescriptionModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-[#0088B1]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        {(order.billing_city?.trim().toLowerCase() ===
                          "patna" ||
                          order.billing_city?.trim().toLowerCase() ===
                            "begusarai") && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenRiderModal(order)}
                              className="p-1 text-gray-500 hover:text-[#0088B1]"
                              title="Assign Rider"
                            >
                              <Bike className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={loading}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
            />

            <PrescriptionModal
              isOpen={prescriptionModalOpen}
              onClose={() => {
                setPrescriptionModalOpen(false);
                setSelectedOrderForPrescription(null);
              }}
              order={selectedOrderForPrescription!}
            />
            <PlaceOrderModal
              isOpen={isPlaceOrderModalOpen}
              onClose={() => setIsPlaceOrderModalOpen(false)}
              onOrderCreated={handleOrderCreated}
            />
            {selectedOrderForRider && (
              <AssignRiderModal
                isOpen={isAssignRiderModalOpen}
                onClose={handleCloseRiderModal}
                order={{
                  id: selectedOrderForRider.id || "",
                  items: (selectedOrderForRider.order_items || []).map(
                    (item) => ({
                      qty: item.quantity || 1,
                      name: item.productName || "Product",
                    })
                  ),
                  amount: selectedOrderForRider.totalorderamount,
                  billing_city: selectedOrderForRider.billing_city || "",
                  billing_state: selectedOrderForRider.billing_state || "",
                  customer_phone: selectedOrderForRider.customerphone || "",
                  billing_country: selectedOrderForRider.billing_country || "",
                  billing_pincode: selectedOrderForRider.billing_pincode || "",
                  billing_address_1:
                    selectedOrderForRider.billing_address_2 || "",
                  billing_address_2:
                    selectedOrderForRider.billing_address_2 || "",
                  billing_last_name:
                    selectedOrderForRider.billing_last_name || "",
                  billing_first_name: selectedOrderForRider.customername || "",
                  rider_delivery_status: getRiderDeliveryStatus(
                    selectedOrderForRider.deliverystatus || ""
                  ),
                }}
                onAssignmentSuccess={handleRiderAssignmentSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
