import React, { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Order } from "../../types/types";
import PrescriptionViewer from "./PrescriptionViewer";

interface OrderPrescriptionsProps {
  order: Order;
}

const OrderPrescriptions: React.FC<OrderPrescriptionsProps> = ({ order }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (order.prescriptions.length === 0) {
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

  const goToPrevious = () => {
    const isFirstPrescription = currentIndex === 0;
    const newIndex = isFirstPrescription
      ? order.prescriptions.length - 1
      : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastPrescription = currentIndex === order.prescriptions.length - 1;
    const newIndex = isLastPrescription ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentPrescription = order.prescriptions[currentIndex];

  return (
    <div className="space-y-4 h-80 ">
      <div className="bg-white p-4 rounded-lg border border-gray-300 relative">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescription Information
        </h3>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-600">Prescription ID</p>
            <p className="font-medium text-xs text-gray-700">
              {currentPrescription.prescription_id}
              <span className="ml-2 text-xs text-gray-500">
                ({currentIndex + 1} of {order.prescriptions.length})
              </span>
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Verified
          </span>
        </div>

        <div className="relative">
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors ml-5"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <PrescriptionViewer prescriptions={[currentPrescription]} />

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors mr-5"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 " />
          </button>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {order.prescriptions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-[#0088B1]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderPrescriptions;
