import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ServiceCompletion {
  id?: number;
  certificate_no: string;
  purchase_order: number; 
  po_number?: string;
  project_name?: string;
  vendor_name?: string;
  completion_date: string;
  remarks: string;
  status: string;
}

export interface ServiceCompletionListResponse {
  count: number;
  results: ServiceCompletion[];
}

export async function getServiceCompletions(): Promise<ServiceCompletionListResponse> {
  return fetchWithCsrf<ServiceCompletionListResponse>(
    `${API_BASE_URL}/service-completions/?format=json`
  );
}

export async function getServiceCompletion(id: number): Promise<ServiceCompletion> {
  return fetchWithCsrf<ServiceCompletion>(
    `${API_BASE_URL}/service-completions/${id}/?format=json`
  );
}

export async function createServiceCompletion(data: Partial<ServiceCompletion>): Promise<ServiceCompletion> {
  return fetchWithCsrf<ServiceCompletion>(
    `${API_BASE_URL}/service-completions/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteServiceCompletion(id: number): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/service-completions/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}