export interface Product {
  brand: string;
  composition: string;
  dosageForm: string;
  strength: string;
  packSize: string;
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
