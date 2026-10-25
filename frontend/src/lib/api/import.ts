import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function importExcelData(formData: FormData): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/vendors/import/?format=json`,
    {
      method: "POST",
      body: formData,
      headers: {}, // FormData ke liye headers khali chhodna zaroori hai
    }
  );
}