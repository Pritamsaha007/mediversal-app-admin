export interface Product {
  productId: string;
  ProductName: string;
  CostPrice: string | number;
  SellingPrice: string | number;
  DiscountedPrice: string | number;
  Type: string;
  PrescriptionRequired: string;
  ColdChain: string;
  ManufacturerName: string;
  Composition: string;
  ProductInformation: string;
  SafetyAdvices: string;
  StorageInstructions: string;
  GST: string | number;
  Coupons?: string | null;
  InventoryUpdated: string;
  InventoryUpdatedBy?: string | null;
  DiscountedPercentage: string | number;
  updated_by: string;
  archivedProduct: boolean;
  HSN_Code?: string | null;
  SKU: string;
  StockAvailableInInventory: number;
  Category: string;
  Subcategory: string;
  productLength: string | number;
  productBreadth: string | number;
  productHeight: string | number;
  productWeight: string | number;
  tax: string | number;
  PackageSize?: string;
  ProductStrength?: string;
  featuredProduct: boolean;
  active: boolean;
  is_deleted: boolean;
  image_url?: string[] | null;
  similarProducts?: Product[] | null;
  substitutes?: Product[] | null;
  subCategoryType?: string;
  dosageForm?: string;
  schedule?: string;
  storageConditions?: string;
}
export interface Statistics {
  activeproducts: string;
  inactiveproducts: string;
  instockproducts: string;
  outofstockproducts: string;
  featuredproducts: string;
  nonfeaturedproducts: string;
  totalcategories: string;
}
export interface ProductSearchParams {
  product_id?: string | null;
  start?: number;
  max?: number;
  search_category?: string | null;
  searchTerm?: string | null;
  filter_manufacturer?: string[] | null;
  filter_product_name?: string[] | null;
  filter_availability?: boolean | null;
  filter_prescription_reqd?: boolean | null;
  filter_subCategory?: string[] | null;
  filter_composition?: string[] | null;
  sort_by?: string | null;
  sort_order?: "ASC" | "DESC" | null;
}

export interface UpsertProductPayload {
  id?: string | null;
  ProductName: string;
  CostPrice: number;
  SellingPrice: number;
  DiscountedPrice: number;
  Type: string;
  PrescriptionRequired: "Yes" | "No" | string;
  ColdChain: "Yes" | "No" | string;
  ManufacturerName: string;
  Composition: string;
  ProductInformation: string;
  SafetyAdvices: string;
  StorageInstructions: string;
  GST: number | string;
  Coupons?: string;
  Category: string;
  Subcategory: string;
  subCategoryType?: string;
  DiscountedPercentage: number;
  HSN_Code?: string;
  SKU: string;
  StockAvailableInInventory: number;
  productLength: number;
  productBreadth: number;
  productHeight: number;
  productWeight: number;
  tax: number;
  ProductStrength?: string;
  PackageSize?: string;
  featuredProduct: boolean;
  active: boolean;
  image_url?: string[];
  archivedProduct?: boolean;
  InventoryUpdatedBy?: string;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
  dosageForm?: string;
  schedule?: string;
  storageConditions?: string;
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
  dosageForm: string;
  storageConditions: string;
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
