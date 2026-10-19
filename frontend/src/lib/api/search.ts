import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface SearchResultItem {
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

export interface GlobalSearchResponse {
  projects: SearchResultItem[];
  bills: SearchResultItem[];
  vendors: SearchResultItem[];
  purchase_orders: SearchResultItem[];
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  return fetchWithCsrf<GlobalSearchResponse>(
    `${API_BASE_URL}/global-search/?q=${encodeURIComponent(query)}`
  );
}