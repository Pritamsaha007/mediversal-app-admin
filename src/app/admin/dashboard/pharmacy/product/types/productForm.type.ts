export interface ProductFormData {
  id?: string;

  ProductName: string;
  SKU: string;
  Category: string;
  Subcategory: string;
  Type: string;
  ManufacturerName: string;
  CostPrice: number | null;
  SellingPrice: number | null;
  StockAvailableInInventory: number | null;
  subCategoryType: string;

  ProductInformation: string;
  SafetyAdvices: string;
  StorageInstructions: string;
  Composition: string;
  dosageForm: string;
  ProductStrength: string | null;
  PackageSize: string;
  productImage: File | string | null;

  schedule: string;
  tax: number;
  HSN_Code: string;
  storageConditions: string;
  // shelfLife: number;
  PrescriptionRequired: boolean;
  featuredProduct: boolean;
  active: boolean;
  ColdChain: string;
  GST: string;
  admin_id: string;
  image_url: string[];
  productLength?: number;
  productBreadth?: number;
  productHeight?: number;
  productWeight?: number;

  DiscountedPrice?: number | null;
  DiscountedPercentage?: number;

  Substitutes?: string[];
  SimilarProducts?: string[];
  Coupons?: string | null;
}

export const categories = [
  "All Categories",
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
  "Cold Chain required",
  "Non-Cold Chain required",
  // "Schedule X",
  // "OTC",
  // "Ayurvedic",
];

export const storageConditions = [
  "Store in cool & dry place",
  "Store below 25°C",
  "Store below 30°C",
  "Store in refrigerator (2-8°C)",
  "Store away from light",
];
export const subcategories = [
  "Cold and Cough",
  "Acidity",
  "Headache",
  "Muscle Cramps",
  "Dehydration",
  "Burn Care",
  "Blocked Nose",
  "Joint Pain",
];

export const symptoms = [
  "Cough Syrups",
  "Lozenges",
  "Vaporubs",
  "Nasal Sprays",
  "Inhalers",
  "Immunity Boosters",
  "Steam Inhalers",
  "Antacids",
  "PPIs",
  "H2 Blockers",
  "Pain Relievers",
  "Migraine Relief",
  "Muscle Relaxants",
  "Pain Relief Creams",
  "ORS Solutions",
  "Electrolyte Powders",
  "Burn Creams",
  "Antiseptic Creams",
  "Nasal Decongestants",
  "Nasal Sprays",
  "Pain Relief Gels",
  "Oral Pain Relievers",
];
