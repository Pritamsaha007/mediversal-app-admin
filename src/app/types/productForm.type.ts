export interface ProductFormData {
  // Basic Information
  productName: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string;
  manufacturer: string;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;

  // Product Details
  description: string;
  composition: string;
  dosageForm: string;
  strength: string;
  packSize: string;

  // Settings
  schedule: string;
  taxRate: number;
  hsnCode: string;
  storageConditions: string;
  shelfLife: number;
  prescriptionRequired: boolean;
  featuredProduct: boolean;
  activeProduct: boolean;
}

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: ProductFormData) => void;
}

export const categories = [
  "All Categories",
  "Medicines",
  "Healthcare",
  "Beauty & Personal Care",
  "Baby Care",
  "Wellness",
];

export const dosageForms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
];

export const schedules = [
  "Schedule H",
  "Schedule H1",
  "Schedule X",
  "OTC",
  "Ayurvedic",
];

export const storageConditions = [
  "Store in cool & dry place",
  "Store below 25°C",
  "Store below 30°C",
  "Store in refrigerator (2-8°C)",
  "Store away from light",
];
