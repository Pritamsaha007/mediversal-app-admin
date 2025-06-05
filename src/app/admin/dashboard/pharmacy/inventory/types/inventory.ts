export interface inventoryItem {
  id: string;
  name: string;
  batch_no: string;
  code: string;
  subcategory: string;
  category: string;
  expiry_date: string;
  stock: number;
  status: "Active" | "Inactive";
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  action: string;
  field: string;
  oldValue: any;
  newValue: any;
  user: string;
  notes: string;
}

export const categories = [
  "All Categories",
  "Antibiotic",
  "Analgesic",
  "Antihypertensive",
  "Statin",
  "Hormone",
  "Proton Pump Inhibitor",
  "Diuretic",
  "Antidepressant",
  "Calcium Channel Blocker",
];

export const sortOptions = [
  "Product Name (A-Z)",
  "Product Name (Z-A)",
  "Selling Price - Low to High",
  "Selling Price - High to Low",
  "Expiry Date (Earliest)",
  "Expiry Date (Latest)",
  "By Stock",
  "Discount",
];

export const tabs = [
  "All Products",
  "In Stock",
  "Low Stock",
  "Out of Stock",
  "Expired",
];
