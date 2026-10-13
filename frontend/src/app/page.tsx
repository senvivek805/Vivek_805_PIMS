"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        router.push("/dashboard");
      } else {
        setError("Please enter email and password");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e0e5ec] relative overflow-hidden p-6">
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div
        className="w-full max-w-sm relative z-10 p-8 rounded-[32px]"
        style={{
          background: "#e0e5ec",
          boxShadow: "20px 20px 60px #b8bcc2, -20px -20px 60px #ffffff",
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{
              background: "#e0e5ec",
              boxShadow: "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
            }}
          >
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
          <p className="text-slate-500 text-xs">Login to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-medium text-xs pl-2">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 z-10" />
              <Input
                id="email"
                type="text"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-0 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{
                  boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium text-xs pl-2">
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
                className="pl-10 pr-10 h-11 border-0 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{
                  boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="remember" className="text-slate-600 cursor-pointer">
                Remember Me
              </Label>
            </div>
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
            style={{
              background: "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
              boxShadow: "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
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

          <div className="flex items-center justify-center gap-2 pt-1">
            <p className="text-center text-xs text-slate-600">
              Don&apos;t have an account?
            </p>
            <Link
              href="/register"
              className="h-7 w-7 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0"
              style={{
                background: "#e0e5ec",
                boxShadow: "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
              }}
            >
              <span className="text-xs">+</span>
            </Link>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            {["G", "f", "in"].map((icon) => (
              <button
                key={icon}
                type="button"
                className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-slate-600 hover:text-blue-600 transition-all"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}