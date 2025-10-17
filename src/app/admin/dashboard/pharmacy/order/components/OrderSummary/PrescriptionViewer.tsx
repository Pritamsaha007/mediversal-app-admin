import React, { useState, useEffect } from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
} from "lucide-react";

interface PrescriptionViewerProps {
  prescription: string;
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  prescription,
}) => {
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clean and parse the prescription URL
  const cleanPrescriptionUrl = (url: string): string => {
    if (!url) return "";

    try {
      // Remove URL encoding
      let cleaned = decodeURIComponent(url);

      // Remove JSON string wrapping like {"url"} or {url}
      cleaned = cleaned.replace(/^\{["']?|["']?\}$/g, "");

      // Remove any remaining quotes
      cleaned = cleaned.replace(/^["']|["']$/g, "");

      return cleaned.trim();
    } catch (error) {
      console.error("Error cleaning URL:", error);
      return url;
    }
  };

  const cleanedPrescription = cleanPrescriptionUrl(prescription);

  useEffect(() => {
    // Log full URL to debug
    console.log("==== PRESCRIPTION URL DEBUG ====");
    console.log("Original URL:", prescription);
    console.log("Cleaned URL:", cleanedPrescription);
    console.log("URL Length:", cleanedPrescription?.length);
    console.log("Is Valid URL:", isValidUrl(cleanedPrescription));
    console.log("================================");

    setImageError(false);
    setIsLoading(true);
  }, [prescription, cleanedPrescription]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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

  const handleDownloadPrescription = async () => {
    try {
      console.log("Starting download for:", cleanedPrescription);

      // Method 1: Try direct fetch with blob
      const response = await fetch(cleanedPrescription, {
        method: "GET",
        headers: {
          Accept: "image/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract filename from URL
      const urlObj = new URL(cleanedPrescription);
      const pathParts = urlObj.pathname.split("/");
      const filename =
        pathParts[pathParts.length - 1] || `prescription-${Date.now()}.jpg`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      console.log("Download successful:", filename);
    } catch (error) {
      console.error("Download failed:", error);

      // Method 2: Fallback - try opening in new window
      try {
        const newWindow = window.open(cleanedPrescription, "_blank");
        if (!newWindow) {
          alert("Please allow pop-ups to download the prescription");
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert(
          "Unable to download. Please try opening the image in a new tab and saving it manually."
        );
      }
    }
  };

  const handleImageError = () => {
    console.error("Image load error for URL:", cleanedPrescription);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setIsLoading(false);
    setImageError(false);
  };

  // Check if prescription URL is valid
  if (!cleanedPrescription || cleanedPrescription.trim() === "") {
    return (
      <div className="space-y-4">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-red-300">
          <div className="relative h-80 flex items-center justify-center">
            <div className="text-center p-6">
              <p className="text-red-600 font-medium mb-2">
                No Prescription URL
              </p>
              <p className="text-sm text-gray-600">
                The prescription URL is empty or invalid
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <div className="relative h-80 flex items-center justify-center overflow-hidden">
          {/* Loading Spinner */}
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">Loading prescription...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {imageError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg">
              <div className="text-red-400 mb-3">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-800 mb-2">
                Unable to Load Prescription
              </p>
              <p className="text-xs text-gray-500 mb-4">
                The image could not be loaded. This may be due to CORS
                restrictions or an invalid URL.
              </p>
              <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4 max-w-full overflow-x-auto">
                <p className="text-xs text-gray-700 font-mono break-all">
                  {cleanedPrescription}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(cleanedPrescription, "_blank")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    setImageError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            /* Image Display */
            <img
              src={cleanedPrescription}
              alt="Prescription"
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                display: isLoading ? "none" : "block",
              }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>

        {/* Image Controls - Only show when image is loaded */}
        {!imageError && !isLoading && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={imageZoom <= 0.5}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={imageZoom >= 3}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-all"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleDownloadPrescription}
              className="p-2 rounded-lg shadow-md hover:opacity-90 text-white transition-all"
              style={{ backgroundColor: "#0088B1" }}
              title="Download prescription"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionViewer;
