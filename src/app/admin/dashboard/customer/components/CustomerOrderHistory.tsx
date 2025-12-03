"use client";
import React, { useState } from "react";
import { Package, Heart, Stethoscope, TestTube } from "lucide-react";
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
    const tabs = [
      {
        id: "pharmacy" as const,
        label: "Pharmacy",
        icon: <Package className="w-4 h-4" />,
      },
      {
        id: "homecare" as const,
        label: "Homecare",
        icon: <Heart className="w-4 h-4" />,
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

    const renderOrderList = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088B1]"></div>
          </div>
        );
      }

      let orders: any[] = [];
      switch (activeTab) {
        case "pharmacy":
          orders = orderData.pharmacy || [];
          break;
        case "homecare":
          orders = orderData.homecare || [];
          break;
        case "consultation":
          orders = orderData.consultations || [];
          break;
        case "labtest":
          orders = orderData.labTests || [];
          break;
      }

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
              No {tabs.find((t) => t.id === activeTab)?.label} Orders
            </p>
            <p className="text-[12px] text-[#899193]">
              This customer hasn't placed any{" "}
              {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} orders
              yet
            </p>
          </div>
        );
      }

      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
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
              {orders.map((order: any) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    {order.id?.slice(0, 8).toUpperCase() || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    {CustomerService.formatDate(
                      order.orderdate ||
                        order.order_date ||
                        order.consultation_date ||
                        order.booking_date
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
                                key={`${order.id}-item-${item.sku || index}`}
                              >
                                • {item.productName || "Unknown Product"}
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
                        {order.homecare_service_name || "N/A"}
                      </div>
                    )}
                    {activeTab === "consultation" && (
                      <div className="text-[10px] text-[#161D1F]">
                        <div className="font-medium">
                          {order.doc_name || "N/A"}
                        </div>
                        {order.doc_specialization?.specialization && (
                          <div className="text-[8px] text-[#899193] mt-0.5">
                            {order.doc_specialization.specialization}
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
                                <div key={`${order.id}-test-${index}`}>
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
                          "N/A"
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
                          "0"
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-[16px] font-medium text-[#161D1F] mb-2">
            Order History by Service
          </h2>
          <p className="text-[12px] text-[#899193]">
            Choose a user from the list to view their complete profile and order
            history
          </p>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0088B1] text-white"
                  : "bg-white text-[#161D1F] border border-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
              {/* {tab.count > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-white text-[#0088B1]"
                    : "bg-gray-100"
                }`}
              >
                {tab.count}
              </span>
            )} */}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {renderOrderList()}
        </div>
      </div>
    );
  }
);

export default CustomerOrderHistory;
