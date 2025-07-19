import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  CreditCard,
  Calendar,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Order, OrderItem, Prescription } from "../types/types";
import { OrderService } from "../services/orderServices";
import StatusBadge from "./StatusBadge";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  if (!isOpen || !order) return null;

  const handlePrevImage = () => {
    if (order.prescriptions.length > 0) {
      setActiveImageIndex((prev) =>
        prev === 0 ? order.prescriptions.length - 1 : prev - 1
      );
      setImageZoom(1);
      setImageRotation(0);
    }
  };

  const handleNextImage = () => {
    if (order.prescriptions.length > 0) {
      setActiveImageIndex((prev) =>
        prev === order.prescriptions.length - 1 ? 0 : prev + 1
      );
      setImageZoom(1);
      setImageRotation(0);
    }
  };

  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleDownloadPrescription = (
    prescriptionUrl: string,
    prescriptionId: string
  ) => {
    const link = document.createElement("a");
    link.href = prescriptionUrl;
    link.download = `prescription-${prescriptionId}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-[#0088B1]/10">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Order Details
            </h2>
            <p className="text-sm font-medium" style={{ color: "#0088B1" }}>
              Order ID: #{order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex h-full max-h-[calc(90vh-100px)]">
          {/* Left Panel - Order Information */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 bg-gray-50">
            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: "#0088B1" }} />
                Customer Information
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {order.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{order.customerPhone}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{order.customerEmail}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {order.customerAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: "#0088B1" }} />
                Order Information
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-700">
                    {OrderService.formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">
                    {OrderService.formatCurrency(
                      parseFloat(order.TotalOrderAmount || "0")
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Status:</span>
                  <StatusBadge status={order.deliverystatus || "Pending"} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-700">
                    {order.paymentMethod}
                  </span>
                </div>
                {order.rapidshypAwb && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AWB Number:</span>
                    <span className="font-medium text-gray-700">
                      {order.rapidshypAwb}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: "#0088B1" }} />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item: OrderItem) => (
                  <div
                    key={item.orderItemId}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700 mb-1">
                          {item.productName || `Product ID: ${item.productId}`}
                        </h4>
                        {item.sku && (
                          <p className="text-gray-500 text-sm">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-700">
                          {OrderService.formatCurrency(
                            parseFloat(item.sellingPrice)
                          )}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Prescription Images */}
          <div className="w-1/2 p-6 overflow-y-auto bg-white">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "#0088B1" }} />
              Prescription Images
              {order.prescriptions.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({order.prescriptions.length}{" "}
                  {order.prescriptions.length === 1 ? "image" : "images"})
                </span>
              )}
            </h3>

            {order.prescriptions.length === 0 ? (
              <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No prescription images available
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Viewer */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative h-96 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        order.prescriptions[activeImageIndex].prescriptionURL
                      }
                      alt={`Prescription ${activeImageIndex + 1}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-prescription.png";
                      }}
                    />
                  </div>

                  {/* Image Controls */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50"
                      disabled={imageZoom <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50"
                      disabled={imageZoom >= 3}
                    >
                      <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200"
                    >
                      <RotateCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadPrescription(
                          order.prescriptions[activeImageIndex].prescriptionURL,
                          order.prescriptions[activeImageIndex].prescription_id
                        )
                      }
                      className="p-2 rounded-lg shadow-md hover:bg-opacity-90 text-white transition-colors duration-200"
                      style={{ backgroundColor: "#0088B1" }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  {order.prescriptions.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 border border-gray-200"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 border border-gray-200"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Info */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600">
                    <span className="text-sm">Prescription ID: </span>
                    <span className="font-medium text-gray-700">
                      {order.prescriptions[activeImageIndex].prescription_id}
                    </span>
                  </div>
                  {order.prescriptions.length > 1 && (
                    <span className="font-medium text-gray-700 text-sm">
                      {activeImageIndex + 1} of {order.prescriptions.length}
                    </span>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {order.prescriptions.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.prescriptions.map((prescription, index) => (
                      <button
                        key={prescription.prescription_id + index}
                        onClick={() => {
                          setActiveImageIndex(index);
                          setImageZoom(1);
                          setImageRotation(0);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-md ${
                          activeImageIndex === index
                            ? "shadow-md"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{
                          borderColor:
                            activeImageIndex === index ? "#0088B1" : undefined,
                        }}
                      >
                        <img
                          src={prescription.prescriptionURL}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-prescription.png";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
