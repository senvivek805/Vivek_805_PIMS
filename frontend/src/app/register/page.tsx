"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cinzel, Great_Vibes, Jost } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderKanban,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { fetchWithCsrf } from "@/lib/api/csrf";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const script = Great_Vibes({ subsets: ["latin"], weight: ["400"] });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const BG_IMAGE = "/login-bg.jpg";
const GOLD = "#d9c08a";

export default function RegisterPage() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);
  const [pressBtn, setPressBtn] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords match nahi kar rahe hain.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithCsrf<any>(
        `${API_BASE_URL}/auth/register/?format=json`,
        {
          method: "POST",
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
          }),
        }
      );

      setSuccess(res.message || "Registration successful! 🎉");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const glassInput =
    "pl-11 pr-11 h-11 rounded-full border border-white/50 text-white placeholder:text-white/75 text-sm transition-colors focus-visible:border-[#d9c08a] focus-visible:ring-2 focus-visible:ring-[#d9c08a]/50 focus-visible:ring-offset-0";

  const glassInputStyle = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 100%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 6px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.12)",
  };

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
      className={`${sans.className} relative min-h-screen w-full flex items-center justify-center p-3 sm:p-8 overflow-hidden`}
      style={{ backgroundColor: "#1d4f5c" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Frame */}
      <div
        className="relative w-full max-w-5xl min-h-[650px] flex flex-col rounded-[32px] border border-white/55"
        style={{
          boxShadow: "0 30px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div className="relative flex-1 flex flex-col p-4 sm:p-7">
          
          {/* NAVBAR */}
          <nav
            className="flex items-center justify-end gap-2 rounded-full border border-white/50 px-3 sm:px-4 py-2"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="rounded-full px-5 py-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full px-5 py-1.5 text-sm font-medium"
                style={{ background: GOLD, color: "#0f3a40", boxShadow: "0 3px 0 #8f7640" }}
              >
                Sign up
              </Link>
            </div>
          </nav>

          {/* BODY */}
          <div className="flex-1 grid md:grid-cols-2 gap-8 md:gap-6 items-center mt-6">
            
            {/* LEFT: PIMS BRANDING */}
            <div className="text-white px-2 sm:px-6 md:px-10 order-2 md:order-1 flex flex-col items-center text-center">
              <div className="p-6 sm:p-8 flex flex-col items-center text-center" style={{ background: "radial-gradient(ellipse at center, rgba(6,32,38,0.5) 0%, rgba(6,32,38,0.22) 55%, rgba(6,32,38,0) 75%)" }}>
                <div className="logo-float h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ borderColor: `${GOLD}cc`, background: "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.08))", boxShadow: "0 14px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
                  <FolderKanban className="h-8 w-8" style={{ color: GOLD }} />
                </div>
                <h1 className={`${cinzel.className} text-7xl sm:text-8xl font-bold leading-none mb-6 inline-block`} style={{ letterSpacing: "0.10em", color: "#f6ebc9", textShadow: "1px 1px 0 #cdb26f, 2px 2px 0 #b99e5e, 3px 3px 0 #a78d51, 4px 4px 0 #957c45, 5px 5px 0 #826c3b, 6px 6px 0 #705d32, 8px 12px 22px rgba(0,0,0,0.6)", borderBottom: `4px solid ${GOLD}`, paddingBottom: "10px" }}>
                  PIMS
                </h1>
                <p className={`${script.className} text-4xl sm:text-5xl text-white leading-tight max-w-md mx-auto`} style={{ textShadow: "0 2px 10px rgba(0,0,0,0.65), 0 4px 18px rgba(0,0,0,0.45)" }}>
                  Project Information Management System
                </p>
              </div>
            </div>

            {/* RIGHT: REGISTER CARD */}
            <div className="order-1 md:order-2">
              <div
                className="login-card relative rounded-[28px] border border-white/60 p-6 sm:p-8 text-white overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 45%, rgba(10,40,40,0.28) 100%)", boxShadow: "0 28px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.15)" }}
              >
                <div className="relative">
                  
                  <div className="text-center mb-6">
                    <h2 className={`${script.className} text-5xl mb-1`} style={{ color: "#f6ebc9", textShadow: "1px 1px 0 #cdb26f, 2px 2px 0 #b99e5e, 3px 3px 0 #a78d51, 4px 4px 0 #957c45, 5px 5px 0 #826c3b, 6px 6px 0 #705d32, 8px 12px 22px rgba(0,0,0,0.6)" }}>
                      Sign Up
                    </h2>
                    <p className="text-white text-xl tracking-wide" style={{ textShadow: "0 1px 6px rgba(0,0,0,6.5)" }}>
                      Create your account
                    </p>
                  </div>

                  {error && (
                    <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-4 border border-red-300/60" style={{ background: "rgba(254, 226, 226, 0.95)", color: "#b91c1c" }}>
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="font-medium">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 mb-4 border border-green-300/60" style={{ background: "rgba(220, 252, 231, 0.95)", color: "#15803d" }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <p className="font-medium">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>First Name</Label>
                        <Input
                          type="text"
                          placeholder="First Name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Last Name</Label>
                        <Input
                          type="text"
                          placeholder="Last Name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Username *</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          type="text"
                          placeholder="Choose a username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#d9c08a]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-white text-xs pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          className={glassInput}
                          style={glassInputStyle}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      onMouseEnter={() => setHoverBtn(true)}
                      onMouseLeave={() => { setHoverBtn(false); setPressBtn(false); }}
                      onMouseDown={() => setPressBtn(true)}
                      onMouseUp={() => setPressBtn(false)}
                      className="w-full h-12 mt-4 rounded-full font-medium text-sm tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        background: loading ? "linear-gradient(135deg, #64748b 0%, #475569 100%)" : hoverBtn ? "linear-gradient(135deg, #f0dfb0 0%, #d9c08a 100%)" : "linear-gradient(135deg, #e8d3a0 0%, #c9ad6e 100%)",
                        color: loading ? "#fff" : "#0f3a40",
                        boxShadow: btnShadow,
                        transform: `translateY(${btnTranslate}px)`,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Signing up...</>
                      ) : (
                        <>REGISTER <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-3 pt-4">
                      <p className="text-center text-xs text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                        Already have an account?
                      </p>
                      <Link
                        href="/login"
                        className="text-xs font-bold hover:underline"
                        style={{ color: GOLD, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                      >
                        Log In
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}