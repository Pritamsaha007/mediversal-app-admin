export interface InsurancePartner {
  id: string;
  name: string;
  logo?: string;
  logoFile?: File;
  active: boolean;
  dateModified: string;
}

export interface CorporateTieUp {
  id: string;
  companyName: string;
  sector: string;
  logo?: string;
  logoFile?: File;
  active: boolean;
  dateModified: string;
}

export type TabType = "Insurance Partners" | "Corporate Tie-Ups";

export type ModalMode = "add" | "edit";

export interface InsuranceFormData {
  name: string;
  logo?: string;
  logoFile?: File;
  active: boolean;
}

export interface CorporateFormData {
  companyName: string;
  sector: string;
  logo?: string;
  logoFile?: File;
  active: boolean;
}

export const SECTOR_OPTIONS = [
  "IT & Software",
  "Manufacturing",
  "Banking & Finance",
  "Healthcare",
  "Retail & E-Commerce",
  "Education",
  "Telecom",
  "Energy & Utilities",
  "Automotive",
  "Real Estate",
];
