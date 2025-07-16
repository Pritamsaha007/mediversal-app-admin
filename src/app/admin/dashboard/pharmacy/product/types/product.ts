export interface Product {
  brand: string;
  composition: string;
  dosageForm: string;
  ProductStrength: string;
  PackageSize: string;
  schedule: string;
  taxRate: number;
  hsnCode: string;
  storageConditions: string;
  shelfLife: number;
  prescriptionRequired: boolean;
  saftyDescription: string;
  storageDescription: string;
  createdAt: string;
  similarCount: number;
  description: string;
  substitutesCount: number;
  manufacturer: string;
  id: string;
  name: string;
  code: string;
  category: string;
  subcategory: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  status: "Active" | "Inactive";
  featured: boolean;
  substitutes?: number;
  similar?: number;
  productImage?: File | string;
  sku: string;
}

export interface inventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  subcategory: string;
  batch_no: string;

  expiry_date: string;
  stock: number;
  status: "Active" | "Inactive";
}

export interface ProductFormData {
  id?: string;
  createdAt?: string;

  // Basic Information
  productName: string;
  SKU: string;
  category: string;
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
  strength: string;
  packSize: string;
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
