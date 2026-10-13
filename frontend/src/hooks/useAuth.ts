"use client";

import { useEffect, useState, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: number | null;
  role_detail: {
    id: number;
    name: string;
    code: string;
    description?: string;
  } | null;
  role_name?: string;
  role_code?: string;
  phone: string;
  designation: string;
  department: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login?: string;
}

// Simple in-memory cache
let cachedUser: AuthUser | null = null;
let cachedAuthState: boolean | null = null;
let lastCheck = 0;
const CACHE_DURATION = 5000; // 5 seconds

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(cachedUser);
  const [loading, setLoading] = useState(cachedAuthState === null);
  const [authenticated, setAuthenticated] = useState(cachedAuthState ?? false);

  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();

    // Use cache if fresh
    if (!force && cachedAuthState !== null && now - lastCheck < CACHE_DURATION) {
      setUser(cachedUser);
      setAuthenticated(cachedAuthState);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check/?format=json`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();

      const isAuth = data.authenticated === true;
      const userData = isAuth ? data.user : null;

      cachedAuthState = isAuth;
      cachedUser = userData;
      lastCheck = now;

      setUser(userData);
      setAuthenticated(isAuth);
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
      cachedUser = null;
      cachedAuthState = false;
      lastCheck = now;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    authenticated,
    refetch: () => checkAuth(true),
  };
}