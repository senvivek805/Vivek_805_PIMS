// ============================================
// PIMS API Client — Vendors Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export type VendorType =
  | "supplier"
  | "contractor"
  | "consultant"
  | "service"
  | "manufacturer"
  | "other";

export type AccountType = "savings" | "current" | "other";

export interface Vendor {
  id: number;
  vendor_code: string;
  reference_no?: string;
  vendor_name: string;
  vendor_type: VendorType;
  vendor_type_display?: string;
  description?: string;

  // Tax
  gst_number?: string;
  pan_number?: string;
  tan_number?: string;

  // Address
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Contact
  contact_person: string;
  email?: string;
  phone: string;
  alternate_phone?: string;

  // Bank
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_branch?: string;
  account_type?: AccountType;
  account_type_display?: string;

  // Status
  is_active: boolean;

  // Audit
  created_at?: string;
  updated_at?: string;
}

export interface VendorCreateUpdate {
  reference_no?: string;
  vendor_name: string;
  vendor_type: VendorType;
  description?: string;
  gst_number?: string;
  pan_number?: string;
  tan_number?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  contact_person: string;
  email?: string;
  phone: string;
  alternate_phone?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_branch?: string;
  account_type?: AccountType | "";
  is_active?: boolean;
}

export interface VendorStats {
  total_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
  type_wise: {
    vendor_type: string;
    label: string;
    count: number;
  }[];
  state_wise: {
    state: string;
    count: number;
  }[];
}

export interface VendorListResponse {
  count: number;
  results: Vendor[];
}

// ============================================
// Labels
// ============================================

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  supplier: "Supplier",
  contractor: "Contractor",
  consultant: "Consultant",
  service: "Service Provider",
  manufacturer: "Manufacturer",
  other: "Other",
};

export const VENDOR_TYPE_EMOJIS: Record<VendorType, string> = {
  supplier: "🏭",
  contractor: "🔨",
  consultant: "💼",
  service: "🛠️",
  manufacturer: "⚙️",
  other: "📌",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  savings: "Savings",
  current: "Current",
  other: "Other",
};

// ============================================
// GET — List with filters
// ============================================

interface GetVendorsParams {
  vendor_type?: VendorType;
  is_active?: boolean;
  search?: string;
  city?: string;
}

export async function getVendors(
  params: GetVendorsParams = {}
): Promise<VendorListResponse> {
  const query = new URLSearchParams();

  if (params.vendor_type) query.append("vendor_type", params.vendor_type);
  if (params.is_active !== undefined)
    query.append("is_active", String(params.is_active));
  if (params.search) query.append("search", params.search);
  if (params.city) query.append("city", params.city);

  query.append("format", "json");

  return fetchWithCsrf<VendorListResponse>(
    `${API_BASE_URL}/vendors/?${query.toString()}`
  );
}

// ============================================
// GET — Single vendor
// ============================================

export async function getVendor(id: number): Promise<Vendor> {
  return fetchWithCsrf<Vendor>(`${API_BASE_URL}/vendors/${id}/?format=json`);
}

// ============================================
// POST — Create
// ============================================

export async function createVendor(
  data: VendorCreateUpdate
): Promise<Vendor> {
  return fetchWithCsrf<Vendor>(`${API_BASE_URL}/vendors/?format=json`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================
// PATCH — Update
// ============================================

export async function updateVendor(
  id: number,
  data: Partial<VendorCreateUpdate>
): Promise<Vendor> {
  return fetchWithCsrf<Vendor>(`${API_BASE_URL}/vendors/${id}/?format=json`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================
// DELETE — Soft delete
// ============================================

export async function deleteVendor(id: number): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/vendors/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Stats
// ============================================

export async function getVendorStats(): Promise<VendorStats> {
  return fetchWithCsrf<VendorStats>(
    `${API_BASE_URL}/vendors/stats/?format=json`
  );
}