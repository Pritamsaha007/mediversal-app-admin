export interface Product {
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
