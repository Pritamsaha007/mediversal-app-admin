export interface BlogSection {
  id: string;
  subtitle: string;
  content: string;
}

export interface Blog {
  id: string;
  title: string;
  shortDescription: string;
  author: string;
  authorSpecialty: string;
  category: string;
  publishDate: string;
  dateAdded: string;
  estimatedReadTime: number;
  coverImage?: string;
  sections: BlogSection[];
  active: boolean;
  featured: boolean;
  publishedByDoctor: boolean;
}

export interface BlogFormBasic {
  title: string;
  shortDescription: string;
  author: string;
  estimatedReadTime: number | "";
  publishDate: string;
  coverImage?: string;
  coverImageFile?: File;
  category: string;
}

export interface BlogFormData extends BlogFormBasic {
  sections: BlogSection[];
  active: boolean;
}

export type BlogModalStep = "basic" | "sections";
export type BlogModalMode = "add" | "edit";

export const BLOG_CATEGORIES = [
  "Cardiology",
  "Nutrition",
  "Patient Experience",
  "AI in Medicine",
  "Daily Health",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Mental Health",
  "Radiology",
];
