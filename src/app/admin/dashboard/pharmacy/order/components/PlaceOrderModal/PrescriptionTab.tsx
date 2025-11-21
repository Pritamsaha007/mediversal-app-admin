import React, { useState } from "react";
import { Upload, X, FileText, Camera, Link } from "lucide-react";
import { useOrderStore } from "../../store/placeOrderStore";
import { uploadFile } from "@/app/admin/dashboard/lab_tests/services";
import { useAdminStore } from "@/app/store/adminStore";

const PrescriptionTab: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const {
    prescriptionUrls,
    updatePrescriptionUrls,
    customerInfo,
    prescriptionItems,
    updatePrescriptionItems,
  } = useOrderStore();
  const { token } = useAdminStore();

  const getBucketName = (): string => {
    const bucketName =
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_DEV
        : process.env.NEXT_PUBLIC_AWS_BUCKET_NAME_PROD;
    if (!bucketName) {
      throw new Error("AWS bucket name is not configured");
    }
    return bucketName;
  };

  const getFileNameFromUri = (fileName: string): string => {
    return `prescription-${Date.now()}-${fileName}`;
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !prescriptionItems || !token) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
          console.error("Please upload a valid image or PDF file.");
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          console.error("File size should be less than 10MB.");
          continue;
        }

        const base64Content = await fileToBase64(file);

        const uploadData = {
          bucketName: getBucketName(),
          folderPath: `customers/customerid-${customerInfo.customerId}/orders/prescription`,
          fileName: getFileNameFromUri(file.name),
          fileContent: base64Content,
        };

        const uploadResponse = await uploadFile(token, uploadData);

        if (uploadResponse.success) {
          updatePrescriptionUrls([...prescriptionUrls, uploadResponse.result]);
        } else {
          console.error("Upload failed for file:", file.name);
        }
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsUploading(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    const newUrls = prescriptionUrls.filter((_, i) => i !== index);
    updatePrescriptionUrls(newUrls);
  };

  const formatFileSize = (url: string) => {
    const ext = url.toLowerCase().split(".").pop();

    switch (ext) {
      case "pdf":
        return "PDF Document";
      case "jpg":
      case "jpeg":
        return "JPEG Image";
      case "png":
        return "PNG Image";
      default:
        return "File";
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    const fullName = url.split("/").pop() || "prescription-file";

    const parts = fullName.split(".");
    const extension = parts.length > 1 ? "." + parts.pop() : "";
    const nameWithoutExt = parts.join(".");

    if (nameWithoutExt.length <= 20) return fullName;

    const shortened = nameWithoutExt.substring(0, 20) + "…";

    return shortened + extension;
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      console.log("URL copied to clipboard");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center p-4 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="prescription-items"
          checked={prescriptionItems}
          onChange={(e) => updatePrescriptionItems(e.target.checked)}
          className="h-4 w-4 accent-[#0088B1] focus:ring-[#0088B1] border-gray-300 rounded"
        />
        <label
          htmlFor="prescription-items"
          className="ml-3 text-sm text-[#161D1F]"
        >
          Order Contains Prescription Items
        </label>
      </div>

      <p className="text-sm text-gray-500">
        Check this if the order includes prescription medications.
      </p>

      {prescriptionItems && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() =>
              document.getElementById("prescription-upload")?.click()
            }
          >
            <input
              type="file"
              id="prescription-upload"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-[#161D1F]">
                  Upload Prescription
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click to upload JPG, PNG, PDF up to 10MB
                </p>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0088B1]"></div>
              <span className="ml-2 text-sm text-gray-500">
                Uploading files...
              </span>
            </div>
          )}

          {prescriptionUrls.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#161D1F]">
                Uploaded Prescriptions ({prescriptionUrls.length})
              </h4>
              <div className="space-y-2">
                {prescriptionUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#0088B1]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-[#161D1F] truncate">
                            {getFileNameFromUrl(url)}
                          </p>
                          <button
                            onClick={() => copyToClipboard(url)}
                            className="p-1 text-gray-400 hover:text-[#0088B1] transition-colors"
                            title="Copy URL"
                          >
                            <Link className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(url)}
                        </p>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0088B1] hover:underline truncate block"
                        >
                          {url.length > 50
                            ? `${url.substring(0, 25)}...${url.substring(
                                url.length - 25
                              )}`
                            : url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionTab;
