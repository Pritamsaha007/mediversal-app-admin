import { useState } from "react";

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

interface ProductHistoryData {
  productName: string;
  productId: string;
  history: HistoryEntry[];
}

export const useProductHistoryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [historyData, setHistoryData] = useState<ProductHistoryData>({
    productName: "",
    productId: "",
    history: [],
  });

  const openHistoryModal = (
    productName: string,
    productId: string,
    history: HistoryEntry[]
  ) => {
    setHistoryData({
      productName,
      productId,
      history,
    });
    setIsOpen(true);
  };

  const closeHistoryModal = () => {
    setIsOpen(false);
    setHistoryData({
      productName: "",
      productId: "",
      history: [],
    });
  };

  return {
    isOpen,
    historyData,
    openHistoryModal,
    closeHistoryModal,
  };
};
