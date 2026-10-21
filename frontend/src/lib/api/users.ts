import { fetchWithCsrf } from "./csrf";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Role {
  id: number;
  name: string;
  code: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: number | null;
  role_name?: string;
  role_code?: string;
  phone: string;
  designation: string;
  department: string;
  is_active: boolean;
  password?: string; // Only for create/update
}

export interface UserCreateUpdate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: number | null;
  phone: string;
  designation: string;
  department: string;
  is_active: boolean;
}

export async function getUsers(): Promise<User[]> {
  return fetchWithCsrf<User[]>(`${API_BASE_URL}/users/`);
}

export async function getRoles(): Promise<Role[]> {
  return fetchWithCsrf<Role[]>(`${API_BASE_URL}/roles/`);
}

export async function createUser(data: UserCreateUpdate): Promise<User> {
  return fetchWithCsrf<User>(`${API_BASE_URL}/users/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: Partial<UserCreateUpdate>): Promise<User> {
  return fetchWithCsrf<User>(`${API_BASE_URL}/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  return fetchWithCsrf<{ message: string }>(`${API_BASE_URL}/users/${id}/`, {
    method: "DELETE",
  });
}