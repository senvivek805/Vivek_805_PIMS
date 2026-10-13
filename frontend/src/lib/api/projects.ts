// ============================================
// PIMS API Client — Projects Module
// ============================================

import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// Types
// ============================================

export interface Agency {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  hod_name?: string;
  description?: string;
}

export type PIRole =
  | "pi"
  | "co_pi"
  | "coordinator"
  | "mentor"
  | "investigator";

export interface ProjectPI {
  id?: number;
  project?: number;
  name: string;
  role: PIRole;
  role_display?: string;
  designation?: string;
  email?: string;
  phone?: string;
  department?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  project_code: string;
  project_name: string;
  description?: string;
  agency?: number;
  department?: number;
  agency_detail?: Agency;
  department_detail?: Department;
  agency_name?: string;
  agency_code?: string;
  department_name?: string;
  department_code?: string;
  start_date?: string;
  end_date?: string;
  pi_name: string;
  co_pi_name?: string;
  coordinator_name?: string;
  pi_names?: string[];
  co_pi_names?: string[];
  sanctioned_amount: string | number;
  status: "active" | "completed" | "on_hold" | "cancelled" | "pending";
  status_display?: string;
  remarks?: string;
  pis?: ProjectPI[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreateUpdate {
  project_code: string;
  project_name: string;
  description?: string;
  agency?: number | null;
  department?: number | null;
  start_date?: string;
  end_date?: string;
  pi_name?: string;
  co_pi_name?: string;
  coordinator_name?: string;
  sanctioned_amount: number;
  status: string;
  remarks?: string;
  pis?: Omit<ProjectPI, "id" | "project" | "created_at" | "updated_at">[];
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  total_sanctioned_amount: number;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

// ============================================
// Helper Functions
// ============================================

export function getAgencyName(project: Project): string {
  return project.agency_detail?.name || project.agency_name || "—";
}

export function getAgencyCode(project: Project): string {
  return project.agency_detail?.code || project.agency_code || "";
}

export function getDepartmentName(project: Project): string {
  return project.department_detail?.name || project.department_name || "—";
}

export function getDepartmentCode(project: Project): string {
  return project.department_detail?.code || project.department_code || "";
}

export interface NormalizedPI {
  id: string;
  name: string;
  role: PIRole;
  role_display: string;
  designation?: string;
  email?: string;
  phone?: string;
  department?: string;
  order: number;
}

export function getProjectPIs(project: Project): NormalizedPI[] {
  const result: NormalizedPI[] = [];
  const seenNames = new Set<string>();

  function addPI(pi: NormalizedPI) {
    const key = pi.name.toLowerCase().trim();
    if (!key || seenNames.has(key)) return;
    seenNames.add(key);
    result.push(pi);
  }

  if (project.pis && project.pis.length > 0) {
    project.pis.forEach((p, idx) => {
      addPI({
        id: String(p.id || `new-${idx}`),
        name: p.name,
        role: p.role,
        role_display: p.role_display || p.role,
        designation: p.designation,
        email: p.email,
        phone: p.phone,
        department: p.department,
        order: p.order || idx + 1,
      });
    });
  }

  if (project.pi_name) {
    addPI({
      id: "legacy-pi",
      name: project.pi_name,
      role: "pi",
      role_display: "Principal Investigator",
      order: result.length + 1,
    });
  }
  if (project.co_pi_name) {
    addPI({
      id: "legacy-co-pi",
      name: project.co_pi_name,
      role: "co_pi",
      role_display: "Co-PI",
      order: result.length + 1,
    });
  }
  if (project.coordinator_name) {
    addPI({
      id: "legacy-coordinator",
      name: project.coordinator_name,
      role: "coordinator",
      role_display: "Coordinator",
      order: result.length + 1,
    });
  }

  return result.sort((a, b) => a.order - b.order);
}

// ============================================
// AGENCIES
// ============================================

export async function getAgencies(): Promise<Agency[]> {
  return fetchWithCsrf<Agency[]>(`${API_BASE_URL}/agencies/?format=json`);
}

// ============================================
// DEPARTMENTS
// ============================================

export async function getDepartments(): Promise<Department[]> {
  return fetchWithCsrf<Department[]>(`${API_BASE_URL}/departments/?format=json`);
}

// ============================================
// PROJECTS
// ============================================

interface GetProjectsParams {
  status?: string;
  agency?: number;
  search?: string;
}

export async function getProjects(
  params: GetProjectsParams = {}
): Promise<PaginatedResponse<Project>> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.agency) query.append("agency", String(params.agency));
  if (params.search) query.append("search", params.search);
  query.append("format", "json");

  return fetchWithCsrf<PaginatedResponse<Project>>(
    `${API_BASE_URL}/projects/?${query.toString()}`
  );
}

export async function getProject(id: number): Promise<Project> {
  return fetchWithCsrf<Project>(`${API_BASE_URL}/projects/${id}/?format=json`);
}

export async function createProject(
  data: ProjectCreateUpdate
): Promise<Project> {
  return fetchWithCsrf<Project>(`${API_BASE_URL}/projects/?format=json`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: number,
  data: Partial<ProjectCreateUpdate>
): Promise<Project> {
  return fetchWithCsrf<Project>(`${API_BASE_URL}/projects/${id}/?format=json`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/projects/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}

export async function getProjectStats(): Promise<ProjectStats> {
  return fetchWithCsrf<ProjectStats>(
    `${API_BASE_URL}/projects/stats/?format=json`
  );
}

// ============================================
// PROJECT BUDGET SUMMARY
// ============================================

export interface ProjectBudgetSummary {
  project: {
    id: number;
    project_code: string;
    project_name: string;
    pi_name: string;
    agency_name?: string;
    department_name?: string;
    start_date?: string;
    end_date?: string;
    status: string;
  };
  summary: {
    total_sanctioned: number;
    total_received: number;
    balance_to_receive: number;
    total_breakup: number;
    remaining_to_breakup: number;
    received_percentage: number;
    breakup_percentage: number;
  };
  receipts: {
    id: number;
    receipt_reference_no: string;
    receipt_date?: string;
    financial_year: string;
    fund_type: string;
    fund_type_display: string;
    amount_received: number;
    total_breakup: number;
    remaining: number;
    breakup_percentage: number;
    is_fully_allocated: boolean;
  }[];
  breakup_by_category: {
    id: number;
    name: string;
    code: string;
    total: number;
    percentage: number;
  }[];
  breakup_by_head: {
    id: number;
    name: string;
    code: string;
    category_id: number;
    category_name: string;
    category_code: string;
    total: number;
    percentage: number;
  }[];
  fy_wise: {
    financial_year: string;
    received: number;
    breakup: number;
  }[];
}

export async function getProjectBudgetSummary(
  projectId: number
): Promise<ProjectBudgetSummary> {
  return fetchWithCsrf<ProjectBudgetSummary>(
    `${API_BASE_URL}/projects/${projectId}/budget-summary/?format=json`
  );
}

// ============================================
// GLOBAL BUDGET OVERVIEW
// ============================================

export interface BudgetOverviewProject {
  id: number;
  project_code: string;
  project_name: string;
  pi_name: string;
  agency_name?: string;
  department_name?: string;
  status: string;
  status_display: string;
  sanctioned: number;
  received: number;
  balance: number;
  breakup: number;
  breakup_percentage: number;
  received_percentage: number;
}

export interface ProjectsBudgetOverviewResponse {
  summary: {
    total_projects: number;
    total_sanctioned: number;
    total_received: number;
    total_breakup: number;
    total_balance: number;
    received_percentage: number;
  };
  projects: BudgetOverviewProject[];
}

export async function getBudgetOverview(
  params: {
    status?: string;
    agency?: number;
    search?: string;
  } = {}
): Promise<ProjectsBudgetOverviewResponse> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.agency) query.append("agency", String(params.agency));
  if (params.search) query.append("search", params.search);
  query.append("format", "json");

  return fetchWithCsrf<ProjectsBudgetOverviewResponse>(
    `${API_BASE_URL}/budget/projects-overview/?${query.toString()}`
  );
}