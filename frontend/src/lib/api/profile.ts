import { fetchWithCsrf } from "./csrf";
import { type AuthUser } from "@/hooks/useAuth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
}

export async function updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
  return fetchWithCsrf<AuthUser>(
    `${API_BASE_URL}/auth/profile/update/?format=json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}
export async function changePassword(data: any): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(
    `${API_BASE_URL}/auth/password/change/?format=json`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}