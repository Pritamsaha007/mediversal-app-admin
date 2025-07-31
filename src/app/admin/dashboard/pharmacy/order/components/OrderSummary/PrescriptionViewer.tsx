import React, { useState } from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Prescription } from "../../types/types";

interface PrescriptionViewerProps {
  prescriptions: Prescription[];
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  prescriptions,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? prescriptions.length - 1 : prev - 1
    );
    setImageZoom(1);
    setImageRotation(0);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) =>
      prev === prescriptions.length - 1 ? 0 : prev + 1
    );
    setImageZoom(1);
    setImageRotation(0);
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
    <div className="space-y-4">
      {/* Image Viewer */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <div className="relative h-80 flex items-center justify-center overflow-hidden">
          <img
            src={prescriptions[activeImageIndex].prescriptionURL}
            alt={`Prescription ${activeImageIndex + 1}`}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
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
                prescriptions[activeImageIndex].prescriptionURL,
                prescriptions[activeImageIndex].prescription_id
              )
            }
            className="p-2 rounded-lg shadow-md hover:bg-opacity-90 text-white transition-colors duration-200"
            style={{ backgroundColor: "#0088B1" }}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {prescriptions.length > 1 && (
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

      {/* Thumbnail Navigation */}
      {prescriptions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {prescriptions.map((prescription, index) => (
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
                borderColor: activeImageIndex === index ? "#0088B1" : undefined,
              }}
            >
              <img
                src={prescription.prescriptionURL}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='8' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionViewer;
