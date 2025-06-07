import React from "react";
import toast from "react-hot-toast";

export interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant?: "danger" | "warning" | "info";
  icon?: React.ReactNode;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  icon,
  position = "top-center",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-100 dark:bg-red-900/20",
          iconColor: "text-red-600 dark:text-red-400",
          confirmBg: "bg-red-600 hover:bg-red-700",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          confirmBg: "bg-yellow-600 hover:bg-yellow-700",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "info":
        return {
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      default:
        return {
          iconBg: "bg-gray-100 dark:bg-gray-700",
          iconColor: "text-gray-600 dark:text-gray-400",
          confirmBg: "bg-gray-600 hover:bg-gray-700",
          borderColor: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getVariantStyles();
  const displayIcon = icon || getDefaultIcon();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 max-w-md w-full mx-4 animate-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {displayIcon && (
          <div
            className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <div className={styles.iconColor}>{displayIcon}</div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${styles.confirmBg} rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

// Hook for easier usage
export const useConfirmationDialog = () => {
  const showConfirmation = (
    props: ConfirmationDialogProps
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = async () => {
        toast.dismiss();
        try {
          await props.onConfirm();
          resolve(true);
        } catch (error) {
          console.error("Confirmation action failed:", error);
          resolve(false);
        }
      };

      const handleCancel = () => {
        toast.dismiss();
        props.onCancel?.();
        resolve(false);
      };

      toast.custom(
        (t) => (
          <ConfirmationDialog
            {...props}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ),
        {
          duration: Infinity,
          position: props.position || "top-center",
          style: {
            background: "transparent",
            boxShadow: "none",
          },
        }
      );
    });
  };

  return { showConfirmation };
};

export default ConfirmationDialog;
