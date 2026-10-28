import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface PendingApprovalsResponse {
  pending_bills: {
    count: number;
    results: any[];
  };
  pending_pos: {
    count: number;
    results: any[];
  };
}

export async function getPendingApprovals(): Promise<PendingApprovalsResponse> {
  return fetchWithCsrf<PendingApprovalsResponse>(
    `${API_BASE_URL}/pending-approvals/?format=json`
  );
}