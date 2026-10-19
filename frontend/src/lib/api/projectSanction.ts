import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface SanctionedHead {
  id?: number;
  budget_head: number;
  budget_head_name?: string;
  sanctioned_amount: number;
}

export async function getProjectSanctionedHeads(projectId: number): Promise<SanctionedHead[]> {
  return fetchWithCsrf<SanctionedHead[]>(
    `${API_BASE_URL}/projects/${projectId}/sanctioned-heads/`
  );
}

export async function saveProjectSanctionedHeads(
  projectId: number, 
  heads: { budget_head: number; sanctioned_amount: number }[]
): Promise<any> {
  return fetchWithCsrf(
    `${API_BASE_URL}/projects/${projectId}/sanctioned-heads/`,
    {
      method: "POST",
      body: JSON.stringify({ heads }),
    }
  );
}