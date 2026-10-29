import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface LeaveType {
  id: number;
  name: string;
  code: string;
}

export interface LeaveApplication {
  id: number;
  employee: number;
  employee_name: string;
  employee_code: string;
  leave_type: number;
  leave_type_name: string;
  leave_type_code: string;
  from_date: string;
  to_date: string;
  total_days: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  applied_at: string;
  approved_by: number | null;
  rejection_reason: string;
}

export interface LeaveBalance {
  id: number;
  employee: number;
  employee_name: string;
  leave_type: number;
  leave_type_code: string;
  year_start_date: string;
  year_end_date: string;
  total_accrued: string;
  used_days: string;
  balance_days: number;
}

export async function getLeaveTypes(): Promise<{ results: LeaveType[] }> {
  return fetchWithCsrf(`${API_BASE_URL}/leave-types/?format=json`);
}

export async function getLeaveApplications(): Promise<{ results: LeaveApplication[] }> {
  return fetchWithCsrf(`${API_BASE_URL}/leave-applications/?format=json`);
}

export async function getLeaveBalances(): Promise<{ results: LeaveBalance[] }> {
  return fetchWithCsrf(`${API_BASE_URL}/leave-balances/?format=json`);
}

export async function applyForLeave(data: any) {
  return fetchWithCsrf(`${API_BASE_URL}/leave-applications/?format=json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateLeaveStatus(id: number, action: "approve" | "reject", reason?: string) {
  return fetchWithCsrf(`${API_BASE_URL}/leave-applications/${id}/action/?format=json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reason }),
  });
}