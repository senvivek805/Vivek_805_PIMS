import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuditLog {
  id: number;
  user_name: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  model_name: string;
  object_id: string;
  object_repr: string;
  changes: Record<string, { old: string; new: string }> | null;
  timestamp: string;
}

export interface AuditLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export async function getAuditLogs(page: number = 1): Promise<AuditLogResponse> {
  return fetchWithCsrf<AuditLogResponse>(
    `${API_BASE_URL}/audit-logs/?page=${page}&format=json`
  );
}