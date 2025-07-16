export interface ProductFormData {
  id?: string;
  createdAt?: string;
  // Basic Information
  productName: string;
  SKU: string;
  Category: string;
  Type: string;
  subCategory: string;
  brand: string;
  manufacturer: string;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;

  // Product Details
  description: string;
  saftyDescription: string;
  storageDescription: string;
  composition: string;
  dosageForm: string;
  ProductStrength: string;
  PackageSize: string;
  productImage: File | null;

  // Settings
  schedule: string;
  taxRate: number;
  HSN_Code: string;
  storageConditions: string;
  shelfLife: number;
  prescriptionRequired: boolean;
  featuredProduct: boolean;
  activeProduct: boolean;
}

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: ProductFormData) => void;
  onUpdateProduct?: (product: ProductFormData) => void;
  productToEdit?: ProductFormData | null;
  isEditMode?: boolean;
}

export const categories = [
  "All",
  "OTC",
  "Prescription",
  "Supplements",
  "Devices",
  "Surgical Care",
  "Vaccines",
  "Personal Care",
  "Sexual Wellness",
  "Mom & Baby",
  "Senior Care",
  "Seasonal Needs",
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
