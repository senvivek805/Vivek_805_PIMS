// ============================================
// PIMS API Client — Bills Module (Form 5)
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export type BillStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "paid"
  | "cancelled";

export interface BillEntryItem {
  id?: number;
  date?: string | null;
  particulars: string;
  amount_rs: string | number;
  amount_paise: string | number;
  remarks?: string;
  order?: number;
}

export interface BillEntry {
  id: number;
  document_no: string;
  bill_no: string;
  bill_date: string;
  diary_voucher_no?: string;
  diary_voucher_date?: string | null;
  project?: number;
  project_code?: string;
  project_name?: string;
  purchase_order?: number;
  po_number?: string;
  vendor?: number;
  vendor_name?: string;
  vendor_detail?: any;
  budget_head?: number;
  budget_head_name?: string;
  major_budget_head?: string;
  minor_budget_head?: string;
  recipient_name: string;
  particulars?: string;
  invoice_no?: string;
  invoice_date?: string | null;
  absentee?: string;
  bill_amount: string | number;
  tds_gst: string | number;
  tds_income_tax: string | number;
  penalty: string | number;
  pbg_security: string | number;
  total_payable: string | number;
  in_words?: string;
  bank_account_name?: string;
  bank_account_no?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  bank_account_type?: string;
  bank_address?: string;
  rtgs_purpose?: string;
  status: BillStatus;
  status_display?: string;
  remarks?: string;
  items?: BillEntryItem[];
  item_count?: number;
  created_at?: string;
  updated_at?: string;
    penalty: string | number;
  penalty_applicable?: boolean;
  pbg_security: string | number;
  pbg_applicable?: boolean;
  other_charges?: string | number;
  other_charges_remarks?: string;
}

export interface BillEntryCreateUpdate {
  bill_no: string;
  bill_date: string;
  diary_voucher_no?: string;
  diary_voucher_date?: string | null;
  project?: number | null;
  purchase_order?: number | null;
  vendor?: number | null;
  budget_head?: number | null;
  major_budget_head?: string;
  minor_budget_head?: string;
  recipient_name: string;
  particulars?: string;
  invoice_no?: string;
  invoice_date?: string | null;
  absentee?: string;
  bill_amount: number;
  tds_gst?: number;
  tds_income_tax?: number;
  penalty?: number;
  pbg_security?: number;
  bank_account_name?: string;
  bank_account_no?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  bank_account_type?: string;
  bank_address?: string;
  rtgs_purpose?: string;
  status?: BillStatus;
  remarks?: string;
  items?: BillEntryItem[];
    penalty?: number;
  penalty_applicable?: boolean;
  pbg_security?: number;
  pbg_applicable?: boolean;
  other_charges?: number;
  other_charges_remarks?: string;
}

export interface BillEntryStats {
  total_bills: number;
  total_payable: number;
  status_wise: {
    status: string;
    label: string;
    count: number;
    amount: number;
  }[];
}

export interface BillEntryListResponse {
  count: number;
  total_payable: number;
  results: BillEntry[];
}

// ============================================
// Labels & Emojis
// ============================================

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const BILL_STATUS_EMOJIS: Record<BillStatus, string> = {
  draft: "📝",
  submitted: "📤",
  approved: "✅",
  paid: "💰",
  cancelled: "❌",
};

export const BILL_STATUS_VARIANTS: Record<
  BillStatus,
  "primary" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  submitted: "info",
  approved: "primary",
  paid: "success",
  cancelled: "danger",
};

// ============================================
// GET — Bills List
// ============================================

interface GetBillsParams {
  project?: number;
  vendor?: number;
  status?: BillStatus;
  search?: string;
}

export async function getBillEntries(
  params: GetBillsParams = {}
): Promise<BillEntryListResponse> {
  const query = new URLSearchParams();

  if (params.project) query.append("project", String(params.project));
  if (params.vendor) query.append("vendor", String(params.vendor));
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<BillEntryListResponse>(
    `${API_BASE_URL}/bills/?${query.toString()}`
  );
}

// ============================================
// GET — Single Bill
// ============================================

export async function getBillEntry(id: number): Promise<BillEntry> {
  return fetchWithCsrf<BillEntry>(
    `${API_BASE_URL}/bills/${id}/?format=json`
  );
}

// ============================================
// POST — Create Bill
// ============================================

export async function createBillEntry(
  data: BillEntryCreateUpdate
): Promise<BillEntry> {
  return fetchWithCsrf<BillEntry>(
    `${API_BASE_URL}/bills/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update Bill
// ============================================

export async function updateBillEntry(
  id: number,
  data: Partial<BillEntryCreateUpdate>
): Promise<BillEntry> {
  return fetchWithCsrf<BillEntry>(
    `${API_BASE_URL}/bills/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft Delete
// ============================================

export async function deleteBillEntry(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/bills/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Stats
// ============================================

export async function getBillEntryStats(): Promise<BillEntryStats> {
  return fetchWithCsrf<BillEntryStats>(
    `${API_BASE_URL}/bills/stats/?format=json`
  );
}