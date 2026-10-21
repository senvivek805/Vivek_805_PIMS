"use client";

import { useState, type MouseEvent } from "react";
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

// Apni beach image ko /public/login-bg.jpg naam se save karo
const BG_IMAGE = "/login-bg.jpg";

const GOLD = "#d9c08a";
const preserve3d = { transformStyle: "preserve-3d" as const };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);
  const [pressBtn, setPressBtn] = useState(false);

  // 3D tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    setMoving(true);
    setTilt({ x: -py * 8, y: px * 12 });
  }

  function handleMouseLeave() {
    setMoving(false);
    setTilt({ x: 0, y: 0 });
  }

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
      console.log("🔵 Login attempt:", username);
      console.log("🔵 Getting CSRF token...");
      const csrfToken = await getCsrfToken();
      console.log("🟢 CSRF token:", csrfToken);

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
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("🔴 Login error:", err);
      setError("Server se connect nahi ho paya: " + (err.message || ""));
      setLoading(false);
    }
  }

  const glassInput =
    "pl-11 pr-11 h-12 rounded-full border border-white/25 bg-white/10 text-white placeholder:text-white/55 text-sm backdrop-blur-md transition-colors focus-visible:border-[#d9c08a] focus-visible:ring-1 focus-visible:ring-[#d9c08a]/60 focus-visible:ring-offset-0";

  const inputInset = {
    boxShadow:
      "inset 3px 3px 8px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(255,255,255,0.12)",
  };

  const navPill =
    "rounded-full border border-white/25 px-5 py-1.5 text-sm text-white/90 hover:bg-white/15 hover:text-white transition-colors";

  // Button 3D depth
  const btnShadow = loading
    ? "0 4px 0 #334155, 0 10px 18px rgba(0,0,0,0.3)"
    : pressBtn
    ? "0 1px 0 #8f7640, 0 4px 8px rgba(0,0,0,0.3)"
    : hoverBtn
    ? "0 8px 0 #8f7640, 0 18px 28px rgba(217,192,138,0.4)"
    : "0 6px 0 #8f7640, 0 14px 22px rgba(0,0,0,0.35)";
  const btnTranslate = pressBtn ? 5 : hoverBtn ? -2 : 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${sans.className} relative min-h-screen w-full flex items-center justify-center p-3 sm:p-8 overflow-hidden`}
      style={{
        perspective: "1400px",
        backgroundColor: "#0f3a40",
        backgroundImage: `url(${BG_IMAGE}), linear-gradient(180deg, #1d6b78 0%, #5fa9ae 45%, #5f8f4e 75%, #b9a877 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes floatA { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
        @keyframes floatB { 0%,100% { transform: translateY(0) } 50% { transform: translateY(14px) } }
        .orb-a { animation: floatA 6s ease-in-out infinite; }
        .orb-b { animation: floatB 7.5s ease-in-out infinite; }
        .logo-float { animation: floatA 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b, .logo-float { animation: none; }
        }
      `}</style>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(6,32,38,0.70) 0%, rgba(6,32,38,0.35) 55%, rgba(6,32,38,0.60) 100%)",
        }}
      />

      {/* ===== 3D TILTING FRAME ===== */}
      <div
        className="relative w-full max-w-5xl min-h-[620px] flex flex-col"
        style={{
          ...preserve3d,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: moving
            ? "transform 0.12s ease-out"
            : "transform 0.7s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Glass background layer (blur lives here so children keep 3D) */}
        <div
          className="absolute inset-0 rounded-[32px] border border-white/20 backdrop-blur-xl"
          style={{
            background: "rgba(255,255,255,0.08)",
            boxShadow: `${-tilt.y * 2}px ${30 + tilt.x * 2}px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        />

        {/* Floating 3D glass orbs */}
        <div
          className="absolute -top-8 -left-6 hidden sm:block"
          style={{ transform: "translateZ(90px)" }}
        >
          <div
            className="orb-a h-24 w-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.85), rgba(217,192,138,0.55) 35%, rgba(15,58,64,0.55) 100%)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.4), inset -6px -8px 14px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <div
          className="absolute -bottom-8 -right-4 hidden sm:block"
          style={{ transform: "translateZ(110px)" }}
        >
          <div
            className="orb-b h-16 w-16 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.9), rgba(95,169,174,0.6) 40%, rgba(15,58,64,0.6) 100%)",
              boxShadow:
                "0 16px 32px rgba(0,0,0,0.4), inset -4px -6px 10px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Content layer */}
        <div
          className="relative flex-1 flex flex-col p-4 sm:p-7"
          style={preserve3d}
        >
{/* NAVBAR */}
<nav
  className="flex items-center justify-end gap-2 rounded-full border border-white/20 bg-white/5 px-3 sm:px-4 py-2"
  style={{ transform: "translateZ(30px)" }}
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
          <div
            className="flex-1 grid md:grid-cols-2 gap-8 md:gap-6 items-center mt-6"
            style={preserve3d}
          >
            {/* LEFT: PIMS branding */}
            <div
              className="text-white px-2 sm:px-6 md:px-10 order-2 md:order-1"
              style={preserve3d}
            >
              <div style={{ transform: "translateZ(70px)", ...preserve3d }}>
                <div
                  className="logo-float h-16 w-16 rounded-2xl flex items-center justify-center mb-6 border bg-white/10 backdrop-blur-md"
                  style={{
                    borderColor: `${GOLD}99`,
                    boxShadow:
                      "0 14px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  <FolderKanban className="h-8 w-8" style={{ color: GOLD }} />
                </div>
              </div>

              <h1
                className={`${cinzel.className} text-7xl sm:text-8xl font-bold leading-none`}
                style={{
                  letterSpacing: "0.1em",
                  color: "#f6ebc9",
                  transform: "translateZ(90px)",
                  textShadow:
                    "1px 1px 0 #cdb26f, 2px 2px 0 #b99e5e, 3px 3px 0 #a78d51, 4px 4px 0 #957c45, 5px 5px 0 #826c3b, 6px 6px 0 #705d32, 8px 12px 22px rgba(0,0,0,0.55)",
                }}
              >
                PIMS
              </h1>

              <div
                className="h-px w-28 my-6"
                style={{ background: GOLD, transform: "translateZ(40px)" }}
              />

              <p
                className={`${script.className} text-4xl sm:text-5xl text-white leading-tight max-w-md`}
                style={{
                  transform: "translateZ(60px)",
                  textShadow: "0 4px 16px rgba(0,0,0,0.45)",
                }}
              >
                Project Information Management System
              </p>
            </div>

            {/* RIGHT: 3D Glass login card */}
            <div
              className="order-1 md:order-2 relative"
              style={{ ...preserve3d, transform: "translateZ(50px)" }}
            >
              {/* card glass layer */}
              <div
                className="absolute inset-0 rounded-[28px] border border-white/25 backdrop-blur-2xl"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  boxShadow:
                    "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              />

              <div
                className="relative p-6 sm:p-8 text-white"
                style={preserve3d}
              >
                {/* Tabs */}
                <div
                  className="grid grid-cols-2 mb-6 text-center"
                  style={{ transform: "translateZ(25px)" }}
                >
                  <span
                    className={`${script.className} pb-1 text-4xl border-b-2`}
                    style={{ borderColor: GOLD }}
                  >
                    Log in
                  </span>
                  <Link
                    href="/register"
                    className={`${script.className} pb-1 text-4xl text-white/60 hover:text-white border-b border-white/20 transition-colors`}
                  >
                    Sign up
                  </Link>
                </div>

                {/* Lock Icon */}
                <div
                  className="flex justify-center mb-4"
                  style={{ transform: "translateZ(45px)" }}
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center border bg-white/10 backdrop-blur-md"
                    style={{
                      borderColor: `${GOLD}99`,
                      boxShadow:
                        "0 12px 24px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.35)",
                    }}
                  >
                    <Lock className="h-6 w-6" style={{ color: GOLD }} />
                  </div>
                </div>

                {/* Welcome */}
                <div
                  className="text-center mb-6"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <h2 className={`${script.className} text-5xl mb-1`}>
                    Welcome
                  </h2>
                  <p className="text-white/70 text-xs tracking-wide">
                    Login to continue your journey
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-4 border border-red-300/60"
                    style={{
                      background: "rgba(254, 226, 226, 0.9)",
                      color: "#b91c1c",
                      transform: "translateZ(30px)",
                    }}
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Username */}
                <div
                  className="space-y-2.5 mb-4"
                  style={{ transform: "translateZ(0px)" }}
                >
                  <Label
                    htmlFor="username"
                    className="text-white/90 font-normal text-xs pl-4"
                  >
                    Username or Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 z-10" />
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
                      style={inputInset}
                    />
                  </div>
                </div>

                {/* Password */}
                <div
                  className="space-y-1.5 mb-4"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <Label
                    htmlFor="password"
                    className="text-white/90 font-normal text-xs pl-4"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 z-10" />
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
                      style={inputInset}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
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
                <div
                  className="flex items-center justify-between mb-6 text-xs"
                  style={{ transform: "translateZ(15px)" }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-3.5 w-3.5 rounded border-white/50"
                      style={{ accentColor: GOLD }}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-white/80 font-normal cursor-pointer"
                    >
                      Remember Me
                    </Label>
                  </div>
                  <Link
                    href="#"
                    className="hover:underline underline-offset-4"
                    style={{ color: GOLD }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* LOGIN Button (3D key) */}
                <div style={{ transform: "translateZ(40px)" }}>
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
                </div>

                {/* Register */}
                <div
                  className="flex items-center justify-center gap-3 pt-7"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <p className="text-center text-xs text-white/80">
                    Don&apos;t have an account?
                  </p>
                  <Link
                    href="/register"
                    aria-label="Create an account"
                    className="h-8 w-8 rounded-full flex items-center justify-center border bg-white/10 hover:bg-white/20 transition-colors"
                    style={{
                      borderColor: `${GOLD}99`,
                      color: GOLD,
                      boxShadow:
                        "0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
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
  );
}