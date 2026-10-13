// ============================================
// PIMS API Client — Purchase Orders Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export type POStatus = "draft" | "approved" | "completed" | "cancelled";
export type GSTType = "cgst_sgst" | "igst";
export type TCTemplate = "material" | "service" | "custom";

export interface PurchaseOrderItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit?: string;
  rate: number;
  gst_rate: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  gst_amount?: number;
  amount?: number;
  order?: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  po_date: string;
  department_school: string;

  // Relations
  vendor: number;
  vendor_name?: string;
  vendor_code?: string;
  vendor_detail?: {
    id: number;
    vendor_code: string;
    vendor_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    gst_number?: string;
    pan_number?: string;
    contact_person: string;
    phone: string;
    email?: string;
  };

  project?: number;
  project_code?: string;
  project_name?: string;
  project_detail?: {
    id: number;
    project_code: string;
    project_name: string;
    pi_name: string;
  };

  budget_head?: number;

  // Header
  approximate_cost: number;
  major_budget_head?: string;
  minor_budget_head?: string;
  budget_grant?: string;
  amount_spent?: string;
  balance_available?: string;

  // Subject
  subject?: string;
  body_description?: string;

  // T&C
  tc_template: TCTemplate;
  terms_conditions?: string;

  // Financial
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_amount: number;
  grand_total: number;
  in_words?: string;
  gst_type: GSTType;

  // Status
  status: POStatus;
  status_display?: string;

  // Extra
  reference_no?: string;
  remarks?: string;

  // Items
  items?: PurchaseOrderItem[];
  item_count?: number;
  received_items_count?: number;
  total_items_count?: number;
  received_status?: string;
  is_fully_received?: boolean;

  // Audit
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderCreateUpdate {
  po_number: string;
  po_date: string;
  department_school: string;
  vendor: number;
  project?: number | null;
  budget_head?: number | null;
  approximate_cost?: number;
  major_budget_head?: string;
  minor_budget_head?: string;
  budget_grant?: string;
  amount_spent?: string;
  balance_available?: string;
  subject?: string;
  body_description?: string;
  tc_template?: TCTemplate;
  terms_conditions?: string;
  reference_no?: string;
  remarks?: string;
  status?: POStatus;
  items: PurchaseOrderItem[];
}

export interface POStats {
  total_orders: number;
  total_amount: number;
  status_wise: {
    status: string;
    label: string;
    count: number;
    amount: number;
  }[];
}

export interface POListResponse {
  count: number;
  total_amount: number;
  results: PurchaseOrder[];
}

// ============================================
// Labels & Config
// ============================================

export const STATUS_LABELS: Record<POStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_EMOJIS: Record<POStatus, string> = {
  draft: "📝",
  approved: "✅",
  completed: "🎯",
  cancelled: "❌",
};

export const STATUS_BADGE_VARIANTS: Record<
  POStatus,
  "primary" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  approved: "success",
  completed: "primary",
  cancelled: "danger",
};

export const GST_TYPE_LABELS: Record<GSTType, string> = {
  cgst_sgst: "CGST + SGST (Intra-State)",
  igst: "IGST (Inter-State)",
};

export const GST_RATE_OPTIONS = [
  { value: 0, label: "0% (Exempt)" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

export const TC_TEMPLATE_OPTIONS: { value: TCTemplate; label: string }[] = [
  { value: "material", label: "Material Purchase" },
  { value: "service", label: "Service / Consultancy" },
  { value: "custom", label: "Custom" },
];

// ============================================
// Helper — Format Currency
// ============================================

export function formatCurrency(amount: string | number | undefined): string {
  if (!amount) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatCompact(amount: string | number | undefined): string {
  if (!amount) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ============================================
// GET — List with filters
// ============================================

interface GetPOsParams {
  status?: POStatus;
  project?: number;
  vendor?: number;
  search?: string;
}

export async function getPurchaseOrders(
  params: GetPOsParams = {}
): Promise<POListResponse> {
  const query = new URLSearchParams();

  if (params.status) query.append("status", params.status);
  if (params.project) query.append("project", String(params.project));
  if (params.vendor) query.append("vendor", String(params.vendor));
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<POListResponse>(
    `${API_BASE_URL}/purchase-orders/?${query.toString()}`
  );
}

// ============================================
// GET — Single
// ============================================

export async function getPurchaseOrder(id: number): Promise<PurchaseOrder> {
  return fetchWithCsrf<PurchaseOrder>(
    `${API_BASE_URL}/purchase-orders/${id}/?format=json`
  );
}

// ============================================
// POST — Create
// ============================================

export async function createPurchaseOrder(
  data: PurchaseOrderCreateUpdate
): Promise<PurchaseOrder> {
  return fetchWithCsrf<PurchaseOrder>(
    `${API_BASE_URL}/purchase-orders/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update
// ============================================

export async function updatePurchaseOrder(
  id: number,
  data: Partial<PurchaseOrderCreateUpdate>
): Promise<PurchaseOrder> {
  return fetchWithCsrf<PurchaseOrder>(
    `${API_BASE_URL}/purchase-orders/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft delete
// ============================================

export async function deletePurchaseOrder(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/purchase-orders/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Stats
// ============================================

export async function getPurchaseOrderStats(): Promise<POStats> {
  return fetchWithCsrf<POStats>(
    `${API_BASE_URL}/purchase-orders/stats/?format=json`
  );
}
// ============================================
// PENDING PURCHASE ORDERS — ALERT
// ============================================

export interface PendingItem {
  item_name: string;
  ordered_qty: number;
  received_qty: number;
  pending_qty: number;
  unit?: string;
}

export interface PendingPO {
  id: number;
  po_number: string;
  po_date?: string;
  vendor_name: string;
  project_name?: string;
  grand_total: number;
  total_items: number;
  fully_received: number;
  pending_count: number;
  pending_items: PendingItem[];
}

export interface PendingPOsResponse {
  count: number;
  total_pending_items: number;
  results: PendingPO[];
}

export async function getPendingPurchaseOrders(): Promise<PendingPOsResponse> {
  return fetchWithCsrf<PendingPOsResponse>(
    `${API_BASE_URL}/purchase-orders/pending-alerts/?format=json`
  );
}