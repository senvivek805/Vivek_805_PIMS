"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderKanban,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);

  async function getCsrfToken() {
    // Get CSRF token from Django
    const res = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.csrfToken;
  }

  async function handleSubmit() {
    setError("");

    if (!username.trim() || !password) {
      setError("Username aur password dono zaroori hain.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔵 Login attempt:", username);

      // 1. Get CSRF token
      console.log("🔵 Getting CSRF token...");
      const csrfToken = await getCsrfToken();
      console.log("🟢 CSRF token:", csrfToken);

      // 2. Login with CSRF token
      const res = await fetch(`${API_BASE_URL}/auth/login/?format=json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      console.log("🟢 Response status:", res.status);

      const data = await res.json();
      console.log("🟢 Response data:", data);

      if (!res.ok) {
        setError(
          data.detail ||
            data.message ||
            "Login failed. Username ya password galat hai."
        );
        setLoading(false);
        return;
      }

      console.log("✅ Login successful — redirecting to /dashboard");

      // STRONG REDIRECT — full page reload
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("🔴 Login error:", err);
      setError("Server se connect nahi ho paya: " + (err.message || ""));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e0e5ec] relative overflow-hidden p-6">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      {/* Main Card */}
      <div
        className="w-full max-w-sm relative z-10 p-8 rounded-[32px]"
        style={{
          background: "#e0e5ec",
          boxShadow: "20px 20px 60px #b8bcc2, -20px -20px 60px #ffffff",
        }}
      >
        {/* PIMS Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "#e0e5ec",
              boxShadow: "5px 5px 10px #b8bcc2, -5px -5px 10px #ffffff",
            }}
          >
            <FolderKanban className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-wide">
            PIMS
          </h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
            Project Information Management System
          </p>
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
            }}
          >
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Welcome */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
          <p className="text-slate-500 text-xs">
            Login to continue your journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-4"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#dc2626",
            }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5 mb-4">
          <Label
            htmlFor="username"
            className="text-slate-700 font-medium text-xs pl-2"
          >
            Username or Email
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 z-10" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="pl-10 h-11 border-0 rounded-xl bg-[#e0e5ec] text-sm text-slate-700"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 mb-4">
          <Label
            htmlFor="password"
            className="text-slate-700 font-medium text-xs pl-2"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 z-10" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="pl-10 pr-10 h-11 border-0 rounded-xl bg-[#e0e5ec] text-sm text-slate-700"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 z-10"
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            <Label
              htmlFor="remember"
              className="text-slate-600 cursor-pointer"
            >
              Remember Me
            </Label>
          </div>
          <Link
            href="#"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: loading
              ? "linear-gradient(135deg, #64748b 0%, #475569 100%)"
              : hoverBtn
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
            boxShadow:
              hoverBtn && !loading
                ? "8px 8px 18px #b8bcc2, -8px -8px 18px #ffffff"
                : "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff",
            transform:
              hoverBtn && !loading ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.3s ease",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              LOGIN
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Register */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <p className="text-center text-xs text-slate-600">
            Don&apos;t have an account?
          </p>
          <Link
            href="/register"
            className="h-7 w-7 rounded-full flex items-center justify-center text-blue-600"
            style={{
              background: "#e0e5ec",
              boxShadow: "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
            }}
          >
            <span className="text-xs">+</span>
          </Link>
        </div>
      </div>
    </div>
  );
}