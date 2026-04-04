"use client";
import React, { useState, useMemo } from "react";
import {
  Package,
  Heart,
  Stethoscope,
  TestTube,
  HeartHandshake,
  Search,
  X,
} from "lucide-react";
import { CustomerService } from "../services/customerService";
import {
  ConsultationOrder,
  PharmacyOrder,
  HomecareOrder,
  LabTestBooking,
} from "../type/customerDetailTypes";

interface CustomerOrderHistoryProps {
  orderData: {
    consultations: ConsultationOrder[];
    pharmacy: PharmacyOrder[];
    homecare: HomecareOrder[];
    labTests: LabTestBooking[];
  };
  loading: boolean;
  customerName: string;
}

const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = React.memo(
  ({ orderData, loading, customerName }) => {
    const [activeTab, setActiveTab] = useState<
      "pharmacy" | "homecare" | "consultation" | "labtest"
    >("pharmacy");
    const [searchTerm, setSearchTerm] = useState("");

    const tabs = [
      {
        id: "pharmacy" as const,
        label: "Pharmacy",
        icon: <Package className="w-4 h-4" />,
      },
      {
        id: "homecare" as const,
        label: "Homecare",
        icon: <HeartHandshake className="w-4 h-4" />,
      },
      {
        id: "consultation" as const,
        label: "Doctor Consultation",
        icon: <Stethoscope className="w-4 h-4" />,
      },
      {
        id: "labtest" as const,
        label: "Lab Tests",
        icon: <TestTube className="w-4 h-4" />,
      },
    ];

    const getStatusBadgeColor = (status: string) => {
      const statusLower = status?.toLowerCase();
      if (statusLower === "delivered" || statusLower === "completed") {
        return "bg-[#42A570] text-white";
      }
      if (statusLower === "in-progress" || statusLower === "pending") {
        return "bg-[#FFD700] text-white";
      }
      if (statusLower === "cancelled") {
        return "bg-[#EB5757] text-white";
      }
      return "bg-gray-500 text-white";
    };

    const searchPharmacyOrders = (orders: PharmacyOrder[], search: string) => {
      if (!search) return orders;
      const searchLower = search.toLowerCase();
      return orders.filter((order) => {
        if (order.id?.toLowerCase().includes(searchLower)) return true;

        if (
          order.order_items?.some((item) =>
            item.productName?.toLowerCase().includes(searchLower),
          )
        )
          return true;
        return false;
      });
    };

    const searchHomecareOrders = (orders: HomecareOrder[], search: string) => {
      if (!search) return orders;
      const searchLower = search.toLowerCase();
      return orders.filter((order) => {
        if (order.id?.toLowerCase().includes(searchLower)) return true;

        if (order.homecare_service_name?.toLowerCase().includes(searchLower))
          return true;
        return false;
      });
    };

    const searchConsultationOrders = (
      orders: ConsultationOrder[],
      search: string,
    ) => {
      if (!search) return orders;
      const searchLower = search.toLowerCase();
      return orders.filter((order) => {
        if (order.id?.toLowerCase().includes(searchLower)) return true;

        if (order.doc_name?.toLowerCase().includes(searchLower)) return true;
        if (
          order.doc_specialization?.specialization
            ?.toLowerCase()
            .includes(searchLower)
        )
          return true;
        return false;
      });
    };

    const searchLabTestOrders = (orders: LabTestBooking[], search: string) => {
      if (!search) return orders;
      const searchLower = search.toLowerCase();
      return orders.filter((order) => {
        if (order.id?.toLowerCase().includes(searchLower)) return true;

        if (
          order.labtestnames?.some((test) =>
            test?.toLowerCase().includes(searchLower),
          )
        )
          return true;
        return false;
      });
    };

    const getFilteredOrders = () => {
      switch (activeTab) {
        case "pharmacy":
          return searchPharmacyOrders(
            [...orderData.pharmacy].reverse(),
            searchTerm,
          );
        case "homecare":
          return searchHomecareOrders(orderData.homecare || [], searchTerm);
        case "consultation":
          return searchConsultationOrders(
            orderData.consultations || [],
            searchTerm,
          );
        case "labtest":
          return searchLabTestOrders(orderData.labTests || [], searchTerm);
        default:
          return [];
      }
    };

    const filteredOrders = getFilteredOrders();

    const renderOrderList = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]"></div>
          </div>
        );
      }

      let orders: any[] = filteredOrders;

      if (!orders || orders.length === 0) {
        return (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === "pharmacy" && (
                <Package className="w-8 h-8 text-gray-400" />
              )}
              {activeTab === "homecare" && (
                <Heart className="w-8 h-8 text-gray-400" />
              )}
              {activeTab === "consultation" && (
                <Stethoscope className="w-8 h-8 text-gray-400" />
              )}
              {activeTab === "labtest" && (
                <TestTube className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-[14px] font-medium text-[#161D1F] mb-1">
              {searchTerm
                ? "No matching orders found"
                : `No ${tabs.find((t) => t.id === activeTab)?.label} Orders`}
            </p>
            <p className="text-[12px] text-[#899193]">
              {searchTerm
                ? `Try searching with a different keyword`
                : `This customer hasn't placed any ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} orders yet`}
            </p>
          </div>
        );
      }

      return (
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#161D1F]">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#161D1F]">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#161D1F]">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#161D1F]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#161D1F]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order: any, index: number) => (
                <tr
                  key={order.id || order.order_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    {order.id?.slice(0, 8).toUpperCase() ||
                      order.order_id?.slice(0, 8).toUpperCase() ||
                      order.booking_id?.slice(0, 8).toUpperCase() ||
                      "N/A"}
                  </td>

                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    {CustomerService.formatDate(
                      order.orderdate ||
                        order.order_date ||
                        order.consultation_date ||
                        order.booking_date,
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === "pharmacy" && order.order_items && (
                      <div className="text-[10px] text-[#161D1F] space-y-1">
                        {order.order_items.length > 0 ? (
                          order.order_items
                            .slice(0, 2)
                            .map((item: any, index: number) => (
                              <div
                                key={`${order.id}-item-${index}-${item.productId || item.sku || item.productName}`}
                              >
                                •{" "}
                                {item.productName ||
                                  item.product_name ||
                                  "Unknown Product"}
                              </div>
                            ))
                        ) : (
                          <div>No items</div>
                        )}
                        {order.order_items.length > 2 && (
                          <div className="text-[8px] text-[#899193]">
                            +{order.order_items.length - 2} more items
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "homecare" && (
                      <div className="text-[10px] text-[#161D1F]">
                        <div>{order.homecare_service_name || "N/A"}</div>
                        {order.address && (
                          <div className="text-[8px] text-[#899193] mt-0.5">
                            {order.address}
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "consultation" && (
                      <div className="text-[10px] text-[#161D1F]">
                        <div className="font-medium">
                          Dr. {order.doc_name || "N/A"}
                        </div>
                        {order.doc_specialization?.specialization && (
                          <div className="text-[8px] text-[#899193] mt-0.5">
                            {order.doc_specialization.specialization}
                          </div>
                        )}
                        {order.consultation_type && (
                          <div className="text-[8px] text-[#0088B1] mt-0.5">
                            {order.consultation_type}
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "labtest" && (
                      <div className="text-[10px] text-[#161D1F]">
                        {order.labtestnames && order.labtestnames.length > 0 ? (
                          <div className="space-y-1">
                            {order.labtestnames
                              .slice(0, 2)
                              .map((testName: string, index: number) => (
                                <div
                                  key={`${order.id}-test-${index}-${testName}`}
                                >
                                  • {testName}
                                </div>
                              ))}
                            {order.labtestnames.length > 2 && (
                              <div className="text-[8px] text-[#899193]">
                                +{order.labtestnames.length - 2} more tests
                              </div>
                            )}
                          </div>
                        ) : (
                          "No tests specified"
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded text-[8px] font-medium ${getStatusBadgeColor(
                        order.status ||
                          order.deliverystatus ||
                          order.order_status ||
                          "N/A",
                      )}`}
                    >
                      {order.status ||
                        order.deliverystatus ||
                        order.order_status ||
                        "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-medium text-[#161D1F]">
                    {CustomerService.formatCurrency(
                      parseFloat(
                        order.totalorderamount ||
                          order.total_amount ||
                          order.order_total ||
                          order.amount ||
                          "0",
                      ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const handleClearSearch = () => {
      setSearchTerm("");
    };

    return (
      <div className="h-full flex flex-col">
        <div className="p-6 pb-4">
          <h2 className="text-[16px] font-medium text-[#161D1F] mb-2">
            Order History by Service
          </h2>
          <p className="text-[12px] text-[#899193]">
            Choose a user from the list to view their complete profile and order
            history
          </p>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by order ID`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-xs text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0088B1] focus:border-[#0088B1]"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-[#899193]">
              Found {filteredOrders.length} result
              {filteredOrders.length !== 1 ? "s" : ""} for "{searchTerm}"
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-4 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm(""); // Clear search when changing tabs
              }}
              className={`flex items-center gap-2 px-4 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0088B1] text-white"
                  : "bg-white text-[#161D1F] border border-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">{renderOrderList()}</div>
      </div>
    );
  },
);

CustomerOrderHistory.displayName = "CustomerOrderHistory";

export default CustomerOrderHistory;
