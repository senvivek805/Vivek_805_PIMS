// ============================================
// PIMS API Client — Funds Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types — Fund Receipt
// ============================================

export type FundType =
  | "grant"
  | "consultancy"
  | "donation"
  | "sponsored"
  | "seed"
  | "infra"
  | "other";

export interface FundReceipt {
  id: number;
  project: number;
  project_code?: string;
  project_name?: string;
  project_detail?: {
    id: number;
    project_code: string;
    project_name: string;
    pi_name: string;
  };
  financial_year: string;
  receipt_date: string;
  receipt_reference_no: string;
  fund_type: FundType;
  fund_type_display?: string;
  amount_received: string | number;
  remarks?: string;
  // Summary fields
  total_breakup?: number;
  remaining?: number;
  breakup_percentage?: number;
  is_fully_allocated?: boolean;
  total_spent?: number;
  total_balance?: number;
  breakups?: FundBreakup[];
  created_at?: string;
  updated_at?: string;
}

export interface FundReceiptCreateUpdate {
  project: number;
  financial_year: string;
  receipt_date: string;
  receipt_reference_no: string;
  fund_type: FundType;
  amount_received: number;
  remarks?: string;
}

export interface FundReceiptStats {
  total_receipts: number;
  total_amount: number;
  fy_wise: { financial_year: string; total: number }[];
  type_wise: { fund_type: string; total: number }[];
}

export interface FundReceiptListResponse {
  count: number;
  total_amount: number;
  results: FundReceipt[];
}

// ============================================
// Types — Budget Category
// ============================================

export interface BudgetCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  order: number;
}

// ============================================
// Types — Budget Head
// ============================================

export interface BudgetHead {
  id: number;
  name: string;
  code: string;
  category: number;
  category_name?: string;
  category_code?: string;
  description?: string;
  order: number;
  is_active: boolean;
}

// ============================================
// Types — Fund Breakup
// ============================================

export interface FundBreakup {
  id: number;
  fund_receipt: number;
  category: number;
  category_name?: string;
  category_code?: string;
  budget_head: number;
  budget_head_name?: string;
  budget_head_code?: string;
  amount: string | number;
  spent_amount?: string | number;
  balance?: string | number;
  utilization_percentage?: string | number;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FundBreakupCreate {
  fund_receipt?: number;
  budget_head: number;
  amount: number;
  remarks?: string;
}

export interface BulkSaveBreakupItem {
  budget_head: number;
  amount: number;
  remarks?: string;
}

export interface BulkSaveResponse {
  message: string;
  total: number;
  receipt_total: number;
  remaining: number;
  results: FundBreakup[];
}

// ============================================
// Helper — Format currency
// ============================================

export function formatCurrency(amount: string | number | undefined): string {
  if (!amount) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatCurrencyDetailed(
  amount: string | number | undefined
): string {
  if (!amount) return "₹0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ============================================
// Fund Type labels
// ============================================

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  grant: "Grant",
  consultancy: "Consultancy",
  donation: "Donation",
  sponsored: "Sponsored",
  seed: "Seed Money",
  infra: "Infrastructure",
  other: "Other",
};

// ============================================
// BUDGET CATEGORIES
// ============================================

export async function getBudgetCategories(): Promise<BudgetCategory[]> {
  return fetchWithCsrf<BudgetCategory[]>(
    `${API_BASE_URL}/budget-categories/?format=json`
  );
}

// ============================================
// BUDGET HEADS
// ============================================

interface GetBudgetHeadsParams {
  category?: number;
}

export async function getBudgetHeads(
  params: GetBudgetHeadsParams = {}
): Promise<BudgetHead[]> {
  const query = new URLSearchParams();
  if (params.category) query.append("category", String(params.category));
  query.append("format", "json");

  return fetchWithCsrf<BudgetHead[]>(
    `${API_BASE_URL}/budget-heads/?${query.toString()}`
  );
}

// ============================================
// FUND RECEIPTS
// ============================================

interface GetFundReceiptsParams {
  project?: number;
  financial_year?: string;
  fund_type?: FundType;
  search?: string;
}

export async function getFundReceipts(
  params: GetFundReceiptsParams = {}
): Promise<FundReceiptListResponse> {
  const query = new URLSearchParams();
  if (params.project) query.append("project", String(params.project));
  if (params.financial_year)
    query.append("financial_year", params.financial_year);
  if (params.fund_type) query.append("fund_type", params.fund_type);
  if (params.search) query.append("search", params.search);
  query.append("format", "json");

  return fetchWithCsrf<FundReceiptListResponse>(
    `${API_BASE_URL}/fund-receipts/?${query.toString()}`
  );
}

export async function getFundReceipt(id: number): Promise<FundReceipt> {
  return fetchWithCsrf<FundReceipt>(
    `${API_BASE_URL}/fund-receipts/${id}/?format=json`
  );
}

export async function createFundReceipt(
  data: FundReceiptCreateUpdate
): Promise<FundReceipt> {
  return fetchWithCsrf<FundReceipt>(
    `${API_BASE_URL}/fund-receipts/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateFundReceipt(
  id: number,
  data: Partial<FundReceiptCreateUpdate>
): Promise<FundReceipt> {
  return fetchWithCsrf<FundReceipt>(
    `${API_BASE_URL}/fund-receipts/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteFundReceipt(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/fund-receipts/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

export async function getFundReceiptStats(): Promise<FundReceiptStats> {
  return fetchWithCsrf<FundReceiptStats>(
    `${API_BASE_URL}/fund-receipts/stats/?format=json`
  );
}

export async function getFundReceiptsByProject(
  projectId: number
): Promise<any> {
  return fetchWithCsrf<any>(
    `${API_BASE_URL}/fund-receipts/by-project/${projectId}/?format=json`
  );
}

// ============================================
// FUND BREAKUPS
// ============================================

interface GetBreakupsResponse {
  count: number;
  results: FundBreakup[];
}

export async function getFundBreakups(
  receiptId: number
): Promise<GetBreakupsResponse> {
  return fetchWithCsrf<GetBreakupsResponse>(
    `${API_BASE_URL}/fund-breakups/?fund_receipt=${receiptId}&format=json`
  );
}

export async function createFundBreakup(
  data: FundBreakupCreate
): Promise<FundBreakup> {
  return fetchWithCsrf<FundBreakup>(
    `${API_BASE_URL}/fund-breakups/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteFundBreakup(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/fund-breakups/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// BULK SAVE BREAKUPS (for UI)
// ============================================

export async function bulkSaveBreakups(
  receiptId: number,
  breakups: BulkSaveBreakupItem[]
): Promise<BulkSaveResponse> {
  return fetchWithCsrf<BulkSaveResponse>(
    `${API_BASE_URL}/fund-receipts/${receiptId}/breakups/bulk-save/?format=json`,
    {
      method: "POST",
      body: JSON.stringify({ breakups }),
    }
  );
}


// ============================================
// BUDGET OVERVIEW (FY-wise, Head-wise, Project-wise)
// ============================================

export interface BudgetOverviewSummary {
  total_received: number;
  total_allocated: number;
  total_spent: number;
  total_balance: number;
}

export interface FYWiseItem {
  fy: string;
  received: number;
  allocated: number;
  spent: number;
  balance: number;
}

export interface HeadWiseItem {
  head_id: number;
  head_name: string;
  head_code: string;
  category_name: string;
  category_code: string;
  allocated: number;
  spent: number;
  balance: number;
  utilization_percentage: number;
}

export interface ProjectWiseItem {
  project_id: number;
  project_code: string;
  project_name: string;
  received: number;
  allocated: number;
  spent: number;
  balance: number;
}

export interface BudgetOverviewResponse {
  summary: BudgetOverviewSummary;
  fy_wise: FYWiseItem[];
  head_wise: HeadWiseItem[];
  project_wise: ProjectWiseItem[];
  available_fys: string[];
}

export async function getBudgetOverview(
  fy?: string,
  project?: number
): Promise<BudgetOverviewResponse> {
  const query = new URLSearchParams();
  if (fy) query.append("fy", fy);
  if (project) query.append("project", String(project));
  query.append("format", "json");

  return fetchWithCsrf<BudgetOverviewResponse>(
    `${API_BASE_URL}/budget/overview/?${query.toString()}`
  );
}