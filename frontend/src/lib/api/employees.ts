// ============================================
// PIMS API Client — Employees Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export type EmployeeType =
  | "faculty"
  | "staff"
  | "jrf"
  | "srf"
  | "ra"
  | "project_staff"
  | "consultant"
  | "other";

export type ManpowerType =
  | "full_time"
  | "part_time"
  | "contract"
  | "visiting";

export type AccountType = "savings" | "current" | "other";

export interface Employee {
  id: number;
  employee_code: string;
  reference_no?: string;
  full_name: string;
  designation: string;
  department?: string;
  employee_type: EmployeeType;
  employee_type_display?: string;

  // Contact
  email?: string;
  phone: string;
  address?: string;

  // Dates
  joining_date: string;
  leaving_date?: string;

  // Project
  assigned_project?: number;
  assigned_project_name?: string;
  assigned_project_code?: string;
  assigned_project_detail?: {
    id: number;
    project_code: string;
    project_name: string;
    pi_name: string;
  };
  project_role?: string;
  manpower_type: ManpowerType;
  manpower_type_display?: string;

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

export interface EmployeeCreateUpdate {
  reference_no?: string;
  full_name: string;
  designation: string;
  department?: string;
  employee_type: EmployeeType;

  email?: string;
  phone: string;
  address?: string;

  joining_date: string;
  leaving_date?: string;

  assigned_project?: number | null;
  project_role?: string;
  manpower_type: ManpowerType;

  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_branch?: string;
  account_type?: AccountType | "";

  is_active?: boolean;
}

export interface EmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  type_wise: {
    employee_type: string;
    label: string;
    count: number;
  }[];
  project_wise: {
    project_id: number;
    project_name: string;
    project_code: string;
    count: number;
  }[];
}

export interface EmployeeListResponse {
  count: number;
  results: Employee[];
}

// ============================================
// Labels & Emojis
// ============================================

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  faculty: "Faculty",
  staff: "Staff",
  jrf: "JRF",
  srf: "SRF",
  ra: "RA",
  project_staff: "Project Staff",
  consultant: "Consultant",
  other: "Other",
};

export const EMPLOYEE_TYPE_EMOJIS: Record<EmployeeType, string> = {
  faculty: "🎓",
  staff: "👤",
  jrf: "🔬",
  srf: "🔬",
  ra: "🎯",
  project_staff: "👥",
  consultant: "💼",
  other: "📌",
};

export const MANPOWER_TYPE_LABELS: Record<ManpowerType, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  visiting: "Visiting",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  savings: "Savings",
  current: "Current",
  other: "Other",
};

// ============================================
// GET — List
// ============================================

interface GetEmployeesParams {
  employee_type?: EmployeeType;
  manpower_type?: ManpowerType;
  project?: number;
  is_active?: boolean;
  department?: string;
  search?: string;
}

export async function getEmployees(
  params: GetEmployeesParams = {}
): Promise<EmployeeListResponse> {
  const query = new URLSearchParams();

  if (params.employee_type) query.append("employee_type", params.employee_type);
  if (params.manpower_type)
    query.append("manpower_type", params.manpower_type);
  if (params.project) query.append("project", String(params.project));
  if (params.is_active !== undefined)
    query.append("is_active", String(params.is_active));
  if (params.department) query.append("department", params.department);
  if (params.search) query.append("search", params.search);

  query.append("format", "json");

  return fetchWithCsrf<EmployeeListResponse>(
    `${API_BASE_URL}/employees/?${query.toString()}`
  );
}

// ============================================
// GET — Single
// ============================================

export async function getEmployee(id: number): Promise<Employee> {
  return fetchWithCsrf<Employee>(
    `${API_BASE_URL}/employees/${id}/?format=json`
  );
}

// ============================================
// POST — Create
// ============================================

export async function createEmployee(
  data: EmployeeCreateUpdate
): Promise<Employee> {
  return fetchWithCsrf<Employee>(`${API_BASE_URL}/employees/?format=json`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================
// PATCH — Update
// ============================================

export async function updateEmployee(
  id: number,
  data: Partial<EmployeeCreateUpdate>
): Promise<Employee> {
  return fetchWithCsrf<Employee>(
    `${API_BASE_URL}/employees/${id}/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ============================================
// DELETE — Soft delete
// ============================================

export async function deleteEmployee(
  id: number
): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/employees/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

// ============================================
// GET — Stats
// ============================================

export async function getEmployeeStats(): Promise<EmployeeStats> {
  return fetchWithCsrf<EmployeeStats>(
    `${API_BASE_URL}/employees/stats/?format=json`
  );
}