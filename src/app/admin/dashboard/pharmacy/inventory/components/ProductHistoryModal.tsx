import React from "react";
import {
  X,
  Clock,
  User,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  field: string;
  oldValue: string | number;
  newValue: string | number;
  user: string;
  notes?: string;
}

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  history: HistoryEntry[];
}

export const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  history,
}) => {
  if (!isOpen) return null;

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "stock_update":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "stock_increase":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "stock_decrease":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "expiry_update":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "status_change":
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "stock_increase":
        return "bg-green-50 border-green-200";
      case "stock_decrease":
        return "bg-red-50 border-red-200";
      case "expiry_update":
        return "bg-orange-50 border-orange-200";
      case "status_change":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-[#161D1F]">
              Product Update History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {productName} <span className="text-gray-400">({productId})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No History Available
              </h3>
              <p className="text-gray-400">
                No updates have been recorded for this product yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 ${getActionColor(
                    entry.action
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getActionIcon(entry.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {formatAction(entry.action)}
                          </h4>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600 capitalize">
                            {entry.field}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Changed from:</span>{" "}
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            {entry.oldValue}
                          </span>{" "}
                          <span className="text-gray-400">to</span>{" "}
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {entry.newValue}
                          </span>
                        </div>

                        {entry.notes && (
                          <div className="text-sm text-gray-600 bg-white bg-opacity-60 p-2 rounded border-l-2 border-gray-300">
                            <span className="font-medium">Notes:</span>{" "}
                            {entry.notes}
                          </div>
                        )}

                        <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{entry.user}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(entry.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088B1]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
