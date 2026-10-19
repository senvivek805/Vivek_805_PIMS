import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface UCHeadData {
  head_id: number;
  head_name: string;
  category: string;
  total_sanctioned: number;
  fy_data: {
    fy: string;
    allocated: number;
    spent: number;
    balance: number;
  }[];
}

export interface UCDataResponse {
  project: {
    id: number;
    code: string;
    name: string;
    pi: string;
    agency: string;
  };
  fys: string[];
  heads: UCHeadData[];
}

export async function getProjectUCData(projectId: number): Promise<UCDataResponse> {
  return fetchWithCsrf<UCDataResponse>(
    `${API_BASE_URL}/projects/${projectId}/uc-data/`
  );
}