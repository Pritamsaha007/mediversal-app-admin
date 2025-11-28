import React from "react";
import { FileText } from "lucide-react";
import { Order } from "../../types/types";
import PrescriptionViewer from "./PrescriptionViewer";

interface OrderPrescriptionsProps {
  order: Order | null;
}

const OrderPrescriptions: React.FC<OrderPrescriptionsProps> = ({ order }) => {
  if (!order) {
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescription Information
        </h3>
        <p className="text-xs text-gray-600">No order data available</p>
      </div>
    );
  }

  if (!order.prescription_id && !order.prescriptionurl) {
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescription Information
        </h3>
        <p className="text-xs text-gray-600">
          No prescriptions associated with this order
        </p>
      </div>
    );
  }

  const prescriptionUrl = order.prescriptionurl;

  if (!prescriptionUrl) {
    return (
      <div className="bg-white p-4 rounded-lg border h-80 border-gray-300 flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescription Information
        </h3>
        <p className="text-xs text-gray-600">Prescription URL not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-80">
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescription Information
        </h3>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-600">Prescription ID</p>
            <p className="font-medium text-xs text-gray-700">
              {order.prescription_id || "N/A"}
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Verified
          </span>
        </div>

        <div className="relative">
          <PrescriptionViewer prescription={prescriptionUrl} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-600">
            <FileText className="w-4 h-4 mr-2" />
            <span>Single prescription attached to this order</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPrescriptions;
