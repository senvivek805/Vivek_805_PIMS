"use client";

import { useState } from "react";
import Link from "next/link";
import { Cinzel, Great_Vibes, Jost } from "next/font/google";
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

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const script = Great_Vibes({ subsets: ["latin"], weight: ["400"] });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Image ko /public/login-bg.jpg naam se rakho
const BG_IMAGE = "/login-bg.jpg";

// true = login card left mein (building clear dikhti hai), false = right mein
const CARD_LEFT = true;

const GOLD = "#d9c08a";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);
  const [pressBtn, setPressBtn] = useState(false);

  async function getCsrfToken() {
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
      const csrfToken = await getCsrfToken();

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

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.detail ||
            data.message ||
            "Login failed. Username ya password galat hai."
        );
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Server se connect nahi ho paya: " + (err.message || ""));
      setLoading(false);
    }
  }

  const glassInput =
    "pl-11 pr-11 h-12 rounded-full border border-white/50 text-white placeholder:text-white/75 text-sm transition-colors focus-visible:border-[#d9c08a] focus-visible:ring-2 focus-visible:ring-[#d9c08a]/50 focus-visible:ring-offset-0";

  const glassInputStyle = {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 6px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.12)",
  };

  const navPill =
    "rounded-full border border-white/50 px-5 py-1.5 text-sm text-white hover:bg-white/25 transition-colors";

  const btnShadow = loading
    ? "0 4px 0 #334155, 0 10px 18px rgba(0,0,0,0.3)"
    : pressBtn
    ? "0 1px 0 #8f7640, 0 4px 8px rgba(0,0,0,0.3)"
    : hoverBtn
    ? "0 8px 0 #8f7640, 0 18px 28px rgba(217,192,138,0.4)"
    : "0 6px 0 #8f7640, 0 14px 22px rgba(0,0,0,0.35)";
  const btnTranslate = pressBtn ? 5 : hoverBtn ? -2 : 0;

  const cardOrder = CARD_LEFT ? "md:order-1" : "md:order-2";
  const brandOrder = CARD_LEFT ? "md:order-2" : "md:order-1";

  return (
    <div
      className={`${sans.className} relative min-h-screen w-full flex items-center justify-center p-3 sm:p-8 overflow-hidden`}
      style={{ backgroundColor: "#1d4f5c" }}
    >
      <style>{`
        @keyframes floatA { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes floatB { 0%,100% { transform: translateY(0) } 50% { transform: translateY(12px) } }
        .orb-a { animation: floatA 6s ease-in-out infinite; }
        .orb-b { animation: floatB 7.5s ease-in-out infinite; }
        .logo-float { animation: floatA 5s ease-in-out infinite; }
        .login-card { transition: transform .35s ease, box-shadow .35s ease; }
        .login-card:hover { transform: translateY(-6px); }
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b, .logo-float { animation: none; }
          .login-card:hover { transform: none; }
        }
      `}</style>

      {/* Crystal-clear background image (Changed position to center) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center center", 
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* FRAME */}
      <div
        className="relative w-full max-w-5xl min-h-[620px] flex flex-col rounded-[32px] border border-white/55"
        style={{
          boxShadow:
            "0 30px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div className="relative flex-1 flex flex-col p-4 sm:p-7">
          {/* NAVBAR */}
          <nav
            className="flex items-center justify-end gap-2 rounded-full border border-white/50 px-3 sm:px-4 py-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-full px-5 py-1.5 text-sm font-medium"
                style={{
                  background: GOLD,
                  color: "#0f3a40",
                  boxShadow: "0 3px 0 #8f7640",
                }}
              >
                Log in
              </Link>
              <Link href="/contact" className={`${navPill} text-xs`}>
                Contact us
              </Link>
            </div>
          </nav>

          {/* BODY */}
          <div className="flex-1 grid md:grid-cols-2 gap-8 md:gap-6 items-center mt-6">
            
            {/* 👇 PIMS BRANDING (Icon above, Text below) */}
            <div
              className={`text-white px-2 sm:px-6 md:px-10 order-2 ${brandOrder} flex flex-col items-center text-center`}
            >
              <div
                className="p-6 sm:p-8 flex flex-col items-center text-center"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(6,32,38,0.5) 0%, rgba(6,32,38,0.22) 55%, rgba(6,32,38,0) 75%)",
                }}
              >
                
                {/* 1. FolderKanban Icon Centered Above PIMS */}
                <div
                  className="logo-float h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border"
                  style={{
                    borderColor: `${GOLD}cc`,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.08))",
                    boxShadow:
                      "0 14px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  <FolderKanban className="h-8 w-8" style={{ color: GOLD }} />
                </div>

                {/* 2. PIMS Text with Full Underline */}
                <h1
                  className={`${cinzel.className} text-7xl sm:text-8xl font-bold leading-none mb-6 inline-block`}
                  style={{
                    letterSpacing: "0.10em",
                    color: "#f6ebc9",
                    textShadow:
                      "1px 1px 0 #cdb26f, 2px 2px 0 #b99e5e, 3px 3px 0 #a78d51, 4px 4px 0 #957c45, 5px 5px 0 #826c3b, 6px 6px 0 #705d32, 8px 12px 22px rgba(0,0,0,0.6)",
                    borderBottom: `4px solid ${GOLD}`,
                    paddingBottom: "10px",
                  }}
                >
                  PIMS
                </h1>

                {/* 3. Subtitle */}
                <p
                  className={`${script.className} text-4xl sm:text-5xl text-white leading-tight max-w-md mx-auto`}
                  style={{
                    textShadow:
                      "0 2px 10px rgba(0,0,0,0.65), 0 4px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  Project Information Management System
                </p>
              </div>
            </div>

            {/* LOGIN CARD */}
            <div className={`order-1 ${cardOrder}`}>
              <div
                className="login-card relative rounded-[28px] border border-white/60 p-6 sm:p-8 text-white overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 45%, rgba(10,40,40,0.28) 100%)",
                  boxShadow:
                    "0 28px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Glass shine streak */}
                <div
                  className="pointer-events-none absolute -top-1/2 -left-1/4 h-full w-1/2 rotate-12"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)",
                  }}
                />

                <div className="relative">
                  {/* Lock Icon */}
                  <div className="flex justify-center mb-4">
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center border"
                      style={{
                        borderColor: `${GOLD}cc`,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.08))",
                        boxShadow:
                          "0 12px 24px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.5)",
                      }}
                    >
                      <Lock className="h-6 w-6" style={{ color: GOLD }} />
                    </div>
                  </div>

                  {/* Welcome */}
                  <div className="text-center mb-6">
                    <h2
                      className={`${script.className} text-6xl mb-2`}
                      style={{
                        color: "#f6ebc9", // 👈 PIMS wala colour
                        textShadow: "1px 1px 0 #cdb26f, 2px 2px 0 #b99e5e, 3px 3px 0 #a78d51, 4px 4px 0 #957c45, 5px 5px 0 #826c3b, 6px 6px 0 #705d32, 8px 12px 22px rgba(0,0,0,0.6)", // 👈 PIMS wali 3D shadow
                      }}
                    >
                      Welcome
                    </h2>
                    <p
                      className="text-[#f6ebc9]/90 text-xl tracking-wide font-medium"
                      style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }} // 👈 Subtitle me bhi halki shadow
                    >
                      Login to continue your journey
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-4 border border-red-300/60"
                      style={{
                        background: "rgba(254, 226, 226, 0.95)",
                        color: "#b91c1c",
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
                      className="text-white font-normal text-xs pl-4"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                    >
                      Username or Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit();
                        }}
                        className={glassInput}
                        style={glassInputStyle}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 mb-4">
                    <Label
                      htmlFor="password"
                      className="text-white font-normal text-xs pl-4"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit();
                        }}
                        className={glassInput}
                        style={glassInputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#d9c08a] z-10"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between mb-6 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-3.5 w-3.5 rounded border-white/60"
                        style={{ accentColor: GOLD }}
                      />
                      <Label
                        htmlFor="remember"
                        className="text-white font-normal cursor-pointer"
                        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                      >
                        Remember Me
                      </Label>
                    </div>
                    <Link
                      href="#"
                      className="hover:underline underline-offset-4"
                      style={{
                        color: "#f1dfae",
                        textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* LOGIN Button (3D key) */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    onMouseEnter={() => setHoverBtn(true)}
                    onMouseLeave={() => {
                      setHoverBtn(false);
                      setPressBtn(false);
                    }}
                    onMouseDown={() => setPressBtn(true)}
                    onMouseUp={() => setPressBtn(false)}
                    className="w-full h-12 rounded-full font-medium text-sm tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: loading
                        ? "linear-gradient(135deg, #64748b 0%, #475569 100%)"
                        : hoverBtn
                        ? "linear-gradient(135deg, #f0dfb0 0%, #d9c08a 100%)"
                        : "linear-gradient(135deg, #e8d3a0 0%, #c9ad6e 100%)",
                      color: loading ? "#fff" : "#0f3a40",
                      boxShadow: btnShadow,
                      transform: `translateY(${btnTranslate}px)`,
                      transition: "all 0.15s ease",
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
                  <div className="flex items-center justify-center gap-3 pt-7">
                    <p
                      className="text-center text-xs text-white"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                    >
                      Don&apos;t have an account?
                    </p>
                    <Link
                      href="/register"
                      aria-label="Create an account"
                      className="h-10 w-10 rounded-full flex items-center justify-center border hover:bg-white/25 transition-colors"
                      style={{
                        borderColor: `${GOLD}cc`,
                        color: "white",
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.08))",
                        boxShadow:
                          "0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)",
                      }}
                    >
                      <span className="text-sm leading-none">+</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}