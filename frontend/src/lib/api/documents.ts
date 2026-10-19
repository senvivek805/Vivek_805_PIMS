import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Document {
  id?: number;
  title: string;
  doc_type: string;
  file?: File | string | null;
  file_url?: string;
  project: number;
  project_name?: string;
  bill?: number | null;
  bill_no?: string;
  purchase_order?: number | null;
  remarks?: string;
  uploaded_at?: string;
}

export interface DocumentListResponse {
  count: number;
  results: Document[];
}

export async function getDocuments(): Promise<DocumentListResponse> {
  return fetchWithCsrf<DocumentListResponse>(
    `${API_BASE_URL}/documents/?format=json`
  );
}

export async function createDocument(data: FormData): Promise<Document> {
  return fetchWithCsrf<Document>(
    `${API_BASE_URL}/documents/?format=json`,
    {
      method: "POST",
      body: data,
      // Note: fetchWithCsrf me headers me "Content-Type": "application/json" set hai.
      // FormData ke liye humein usko override karna padega taaki browser khud boundary set kare.
      headers: {}, 
    }
  );
}

export async function deleteDocument(id: number): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/documents/${id}/?format=json`,
    {
      method: "DELETE",
    }
  );
}