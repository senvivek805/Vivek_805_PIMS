// ============================================
// PIMS API Client — Materials Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export type MaterialUnit =
  | "piece"
  | "set"
  | "box"
  | "kg"
  | "gram"
  | "litre"
  | "ml"
  | "meter"
  | "cm"
  | "job"
  | "packet"
  | "roll"
  | "other";

export interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  order: number;
  material_count?: number;
}

export interface Material {
  id: number;
  material_code: string;
  material_name: string;
  category?: number;
  category_name?: string;
  category_code?: string;
  category_detail?: MaterialCategory;
  unit: MaterialUnit;
  unit_display?: string;
  hsn_code?: string;
  gst_rate: string | number;
  description?: string;
  is_active: boolean;
  total_received?: number;
  total_issued?: number;
  total_returned?: number;
  current_stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialCreateUpdate {
  material_name: string;
  category?: number | null;
  unit: MaterialUnit;
  hsn_code?: string;
  gst_rate: number;
  description?: string;
  is_active?: boolean;
}

export interface MaterialStats {
  total_materials: number;
  active_materials: number;
  inactive_materials: number;
  total_categories: number;
  category_wise: {
    category_id: number;
    category_name: string;
    category_code: string;
    count: number;
  }[];
}

export interface MaterialListResponse {
  count: number;
  results: Material[];
}

// ============================================
// Labels & Emojis
// ============================================

export const UNIT_LABELS: Record<MaterialUnit, string> = {
  piece: "Piece",
  set: "Set",
  box: "Box",
  kg: "Kilogram",
  gram: "Gram",
  litre: "Litre",
  ml: "Millilitre",
  meter: "Meter",
  cm: "Centimeter",
  job: "Job",
  packet: "Packet",
  roll: "Roll",
  other: "Other",
};

export const GST_RATE_OPTIONS = [
  { value: 0, label: "0% (Exempt)" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

// ============================================
// GET — Categories
// ============================================

export async function getMaterialCategories(): Promise<MaterialCategory[]> {
  return fetchWithCsrf<MaterialCategory[]>(
    `${API_BASE_URL}/material-categories/?format=json`
  );
}

// ============================================
// GET — Materials List
// ============================================

interface GetMaterialsParams {
  category?: number;
  unit?: MaterialUnit;
  gst_rate?: number;
  is_active?: boolean;
  search?: string;
}

export async function getMaterials(
  params: GetMaterialsParams = {}
): Promise<MaterialListResponse> {
  const query = new URLSearchParams();

  if (params.category) query.append("category", String(params.category));
  if (params.unit) query.append("unit", params.unit);
  if (params.gst_rate !== undefined)
    query.append("gst_rate", String(params.gst_rate));
  if (params.is_active !== undefined)
    query.append("is_active", String(params.is_active));
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<MaterialListResponse>(
    `${API_BASE_URL}/materials/?${query.toString()}`
  );
}

// ============================================
// GET — Single Material
// ============================================

export async function getMaterial(id: number): Promise<Material> {
  return fetchWithCsrf<Material>(
    `${API_BASE_URL}/materials/${id}/?format=json`
  );
}

// ============================================
// POST — Create Material
// ============================================

export async function createMaterial(
  data: MaterialCreateUpdate
): Promise<Material> {
  return fetchWithCsrf<Material>(
    `${API_BASE_URL}/materials/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update Material
// ============================================

export async function updateMaterial(
  id: number,
  data: Partial<MaterialCreateUpdate>
): Promise<Material> {
  return fetchWithCsrf<Material>(
    `${API_BASE_URL}/materials/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft Delete
// ============================================

export async function deleteMaterial(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/materials/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Stats
// ============================================

export async function getMaterialStats(): Promise<MaterialStats> {
  return fetchWithCsrf<MaterialStats>(
    `${API_BASE_URL}/materials/stats/?format=json`
  );
}

// ============================================
// MATERIAL RECEIPT
// ============================================

export type ReceiptStatus = "draft" | "partial" | "completed" | "cancelled";

export interface MaterialReceiptItem {
  id?: number;
  item_name: string;
  ordered_quantity: string | number;
  received_quantity: string | number;
  pending_quantity?: string | number;
  unit?: string;
  po_item?: number;
  po_number?: string;
  material?: number;
  material_code?: string;
  remarks?: string;
}

export interface MaterialReceipt {
  id: number;
  receipt_no: string;
  receipt_date: string;
  purchase_order: number;
  po_number?: string;
  vendor: number;
  vendor_name?: string;
  vendor_code?: string;
  project?: number;
  project_code?: string;
  project_name?: string;
  status: ReceiptStatus;
  status_display?: string;
  item_count?: number;
  total_received_qty?: number;
  remarks?: string;
  items?: MaterialReceiptItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MaterialReceiptCreateUpdate {
  receipt_date: string;
  purchase_order: number;
  vendor: number;
  project?: number | null;
  status?: ReceiptStatus;
  remarks?: string;
  items: MaterialReceiptItem[];
}

export interface MaterialReceiptStats {
  total_receipts: number;
  draft_receipts: number;
  partial_receipts: number;
  completed_receipts: number;
}

export interface MaterialReceiptListResponse {
  count: number;
  results: MaterialReceipt[];
}

export interface POItemForReceipt {
  id: number;
  item_name: string;
  ordered_quantity: number;
  received_quantity: number;
  pending_quantity: number;
  receipt_numbers?: string[];
  unit: string;
  rate: number;
}

export interface POItemsResponse {
  po: {
    id: number;
    po_number: string;
    po_date: string;
    vendor: number;
    vendor_name: string;
    project: number | null;
    grand_total: number;
  };
  items: POItemForReceipt[];
}

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  draft: "Draft",
  partial: "Partial Received",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const RECEIPT_STATUS_EMOJIS: Record<ReceiptStatus, string> = {
  draft: "📝",
  partial: "🔄",
  completed: "✅",
  cancelled: "❌",
};

export const RECEIPT_STATUS_VARIANTS: Record<
  ReceiptStatus,
  "primary" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  partial: "warning",
  completed: "success",
  cancelled: "danger",
};

// ============================================
// GET — Receipts List
// ============================================

interface GetReceiptsParams {
  purchase_order?: number;
  status?: ReceiptStatus;
  search?: string;
}

export async function getMaterialReceipts(
  params: GetReceiptsParams = {}
): Promise<MaterialReceiptListResponse> {
  const query = new URLSearchParams();

  if (params.purchase_order)
    query.append("purchase_order", String(params.purchase_order));
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<MaterialReceiptListResponse>(
    `${API_BASE_URL}/material-receipts/?${query.toString()}`
  );
}

// ============================================
// GET — Single Receipt
// ============================================

export async function getMaterialReceipt(id: number): Promise<MaterialReceipt> {
  return fetchWithCsrf<MaterialReceipt>(
    `${API_BASE_URL}/material-receipts/${id}/?format=json`
  );
}

// ============================================
// POST — Create Receipt
// ============================================

export async function createMaterialReceipt(
  data: MaterialReceiptCreateUpdate
): Promise<MaterialReceipt> {
  return fetchWithCsrf<MaterialReceipt>(
    `${API_BASE_URL}/material-receipts/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update Receipt
// ============================================

export async function updateMaterialReceipt(
  id: number,
  data: Partial<MaterialReceiptCreateUpdate>
): Promise<MaterialReceipt> {
  return fetchWithCsrf<MaterialReceipt>(
    `${API_BASE_URL}/material-receipts/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft Delete
// ============================================

export async function deleteMaterialReceipt(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/material-receipts/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Receipt Stats
// ============================================

export async function getMaterialReceiptStats(): Promise<MaterialReceiptStats> {
  return fetchWithCsrf<MaterialReceiptStats>(
    `${API_BASE_URL}/material-receipts/stats/?format=json`
  );
}

// ============================================
// GET — PO Items for Receipt (prefill)
// ============================================

export async function getPOItemsForReceipt(
  poId: number
): Promise<POItemsResponse> {
  return fetchWithCsrf<POItemsResponse>(
    `${API_BASE_URL}/material-receipts/po/${poId}/items/?format=json`
  );
}

// ============================================
// MATERIAL ISSUE
// ============================================

export type IssueStatus = "draft" | "issued" | "returned" | "cancelled";

export interface MaterialIssueItem {
  id?: number;
  material: number;
  material_name?: string;
  material_code?: string;
  quantity: string | number;
  unit?: string;
  remarks?: string;
}

export interface MaterialIssue {
  id: number;
  issue_no: string;
  issue_date: string;
  issued_to: number;
  issued_to_name?: string;
  issued_to_code?: string;
  project?: number;
  project_name?: string;
  project_code?: string;
  purchase_order?: number;
  po_number?: string;
  purpose?: string;
  status: IssueStatus;
  status_display?: string;
  item_count?: number;
  total_issued_qty?: number;
  remarks?: string;
  items?: MaterialIssueItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MaterialIssueCreateUpdate {
  issue_date: string;
  issued_to: number;
  project?: number | null;
  purchase_order?: number | null;
  purpose?: string;
  status?: IssueStatus;
  remarks?: string;
  items: MaterialIssueItem[];
}

export interface MaterialIssueStats {
  total_issues: number;
  draft_issues: number;
  issued_issues: number;
  returned_issues: number;
}

export interface MaterialIssueListResponse {
  count: number;
  results: MaterialIssue[];
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const ISSUE_STATUS_EMOJIS: Record<IssueStatus, string> = {
  draft: "📝",
  issued: "📤",
  returned: "↩️",
  cancelled: "❌",
};

export const ISSUE_STATUS_VARIANTS: Record<
  IssueStatus,
  "primary" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  issued: "info",
  returned: "success",
  cancelled: "danger",
};

// ============================================
// GET — Issues List
// ============================================

interface GetIssuesParams {
  issued_to?: number;
  project?: number;
  status?: IssueStatus;
  search?: string;
}

export async function getMaterialIssues(
  params: GetIssuesParams = {}
): Promise<MaterialIssueListResponse> {
  const query = new URLSearchParams();

  if (params.issued_to) query.append("issued_to", String(params.issued_to));
  if (params.project) query.append("project", String(params.project));
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<MaterialIssueListResponse>(
    `${API_BASE_URL}/material-issues/?${query.toString()}`
  );
}

// ============================================
// GET — Single Issue
// ============================================

export async function getMaterialIssue(id: number): Promise<MaterialIssue> {
  return fetchWithCsrf<MaterialIssue>(
    `${API_BASE_URL}/material-issues/${id}/?format=json`
  );
}

// ============================================
// POST — Create Issue
// ============================================

export async function createMaterialIssue(
  data: MaterialIssueCreateUpdate
): Promise<MaterialIssue> {
  return fetchWithCsrf<MaterialIssue>(
    `${API_BASE_URL}/material-issues/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update Issue
// ============================================

export async function updateMaterialIssue(
  id: number,
  data: Partial<MaterialIssueCreateUpdate>
): Promise<MaterialIssue> {
  return fetchWithCsrf<MaterialIssue>(
    `${API_BASE_URL}/material-issues/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft Delete
// ============================================

export async function deleteMaterialIssue(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/material-issues/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Issue Stats
// ============================================

export async function getMaterialIssueStats(): Promise<MaterialIssueStats> {
  return fetchWithCsrf<MaterialIssueStats>(
    `${API_BASE_URL}/material-issues/stats/?format=json`
  );
}

// ============================================
// MATERIAL RETURN NOTE (MRN)
// ============================================

export type ReturnStatus = "draft" | "returned" | "completed" | "cancelled";
export type ReturnCondition = "good" | "damaged" | "lost";

export interface MaterialReturnNoteItem {
  id?: number;
  material: number;
  material_name?: string;
  material_code?: string;
  quantity: string | number;
  unit?: string;
  condition?: ReturnCondition;
  condition_display?: string;
  remarks?: string;
}

export interface MaterialReturnNote {
  id: number;
  mrn_no: string;
  return_date: string;
  material_issue?: number;
  issue_no?: string;
  returned_by: number;
  returned_by_name?: string;
  returned_by_code?: string;
  project?: number;
  project_name?: string;
  project_code?: string;
  reason?: string;
  status: ReturnStatus;
  status_display?: string;
  item_count?: number;
  total_returned_qty?: number;
  remarks?: string;
  items?: MaterialReturnNoteItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MaterialReturnNoteCreateUpdate {
  return_date: string;
  material_issue?: number | null;
  returned_by: number;
  project?: number | null;
  reason?: string;
  status?: ReturnStatus;
  remarks?: string;
  items: MaterialReturnNoteItem[];
}

export interface MaterialReturnStats {
  total_returns: number;
  draft_returns: number;
  returned_returns: number;
  completed_returns: number;
}

export interface MaterialReturnListResponse {
  count: number;
  results: MaterialReturnNote[];
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  draft: "Draft",
  returned: "Returned",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const RETURN_STATUS_EMOJIS: Record<ReturnStatus, string> = {
  draft: "📝",
  returned: "↩️",
  completed: "✅",
  cancelled: "❌",
};

export const RETURN_STATUS_VARIANTS: Record<
  ReturnStatus,
  "primary" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  returned: "info",
  completed: "success",
  cancelled: "danger",
};

export const CONDITION_LABELS: Record<ReturnCondition, string> = {
  good: "Good",
  damaged: "Damaged",
  lost: "Lost",
};

export const CONDITION_EMOJIS: Record<ReturnCondition, string> = {
  good: "✅",
  damaged: "⚠️",
  lost: "❌",
};

// ============================================
// GET — Return Notes List
// ============================================

interface GetReturnsParams {
  returned_by?: number;
  project?: number;
  status?: ReturnStatus;
  search?: string;
}

export async function getMaterialReturns(
  params: GetReturnsParams = {}
): Promise<MaterialReturnListResponse> {
  const query = new URLSearchParams();

  if (params.returned_by)
    query.append("returned_by", String(params.returned_by));
  if (params.project) query.append("project", String(params.project));
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<MaterialReturnListResponse>(
    `${API_BASE_URL}/material-returns/?${query.toString()}`
  );
}

// ============================================
// GET — Single Return Note
// ============================================

export async function getMaterialReturn(
  id: number
): Promise<MaterialReturnNote> {
  return fetchWithCsrf<MaterialReturnNote>(
    `${API_BASE_URL}/material-returns/${id}/?format=json`
  );
}

// ============================================
// POST — Create Return Note
// ============================================

export async function createMaterialReturn(
  data: MaterialReturnNoteCreateUpdate
): Promise<MaterialReturnNote> {
  return fetchWithCsrf<MaterialReturnNote>(
    `${API_BASE_URL}/material-returns/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// PATCH — Update Return Note
// ============================================

export async function updateMaterialReturn(
  id: number,
  data: Partial<MaterialReturnNoteCreateUpdate>
): Promise<MaterialReturnNote> {
  return fetchWithCsrf<MaterialReturnNote>(
    `${API_BASE_URL}/material-returns/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft Delete
// ============================================

export async function deleteMaterialReturn(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/material-returns/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Return Stats
// ============================================

export async function getMaterialReturnStats(): Promise<MaterialReturnStats> {
  return fetchWithCsrf<MaterialReturnStats>(
    `${API_BASE_URL}/material-returns/stats/?format=json`
  );
}

// ============================================
// LOW STOCK ALERTS
// ============================================

export interface LowStockItem {
  id: number;
  material_code: string;
  material_name: string;
  unit: string;
  current_stock: number;
  status: "low_stock" | "out_of_stock";
}

export interface LowStockResponse {
  count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  threshold: number;
  low_stock: LowStockItem[];
  out_of_stock: LowStockItem[];
}

export async function getLowStockMaterials(
  threshold: number = 10
): Promise<LowStockResponse> {
  return fetchWithCsrf<LowStockResponse>(
    `${API_BASE_URL}/materials/low-stock/?threshold=${threshold}&format=json`
  );
}