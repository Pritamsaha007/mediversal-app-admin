export interface Product {
  id: string;
  name: string;
  code: string;
  sku: string;
  category: string;
  subcategory: string;
  subCategoryType: string;
  Type: string;
  brand: string;
  manufacturer: string;
  ManufacturerName: string;

  mrp: number;
  CostPrice: number;
  sellingPrice: number;
  SellingPrice: number;
  DiscountedPrice: number;
  DiscountedPercentage: number;
  stock: number;
  StockAvailableInInventory: number;
  discount: number;

  status: "Active" | "Inactive";
  featured: boolean;
  featuredProduct: boolean;
  active: boolean;
  prescriptionRequired: boolean;
  PrescriptionRequired: boolean;
  ColdChain: string;

  description: string;
  ProductInformation: string;
  composition: string;
  Composition: string;
  dosageForm: string;
  ProductStrength: string;
  PackageSize: string;
  schedule: string;

  saftyDescription: string;
  SafetyAdvices: string;
  storageDescription: string;
  StorageInstructions: string;
  storageConditions: string;
  shelfLife: number;

  taxRate: number;
  tax: number;
  hsnCode: string;
  HSN_Code: string;
  GST: string;

  Substitutes: string[];
  SimilarProducts: string[];
  substitutesCount: number;
  similarCount: number;

  productLength: number;
  productBreadth: number;
  productHeight: number;
  productWeight: number;

  productImage?: File | string;
  createdAt: string;
  admin_id: string;
  Coupons: string | null;
  InventoryUpdatedBy: string;
  updated_by: string;
  archivedProduct: boolean;
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
export interface CacheItem {
  data: any;
  timestamp: number;
}

export interface ProductApiResponse {
  productId: number;
  ProductName: string;
  CostPrice: string;
  SellingPrice: string;
  DiscountedPrice: string;
  Type: string;
  PrescriptionRequired: string;
  ColdChain: string;
  ManufacturerName: string;
  Composition: string;
  ProductInformation: string;
  SafetyAdvices: string;
  StorageInstructions: string;
  ProductStrength: string;
  PackageSize: string;
  GST: string;
  tax: string;
  active: boolean;
  shelfLife: number;
  Coupons: string;
  StockAvailableInInventory: number;
  InventoryUpdated: string;
  InventoryUpdatedBy: number;
  DiscountedPercentage: string;
  updated_by: number;
  archivedProduct: number;
  imageUrls: string[];
  HSN_Code: string;
  substitutes: any[];
  similarProducts: any[];
  SKU: string;
  Subcategory: string;
  Category: string;
  featuredProduct: boolean;
}

interface StatisticsResponse {
  activeProducts: string;
  inactiveProducts: string;
  inStockProducts: string;
  outOfStockProducts: string;
  featuredProducts: string;
  nonfeaturedProducts: string;
  totalCategories: number;
}
